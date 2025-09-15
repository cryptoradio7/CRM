// =====================================================
// EXEMPLE D'UN MOTEUR DE RECHERCHE AVANCÉ
// =====================================================

// 1. SERVICE DE RECHERCHE AVEC CACHE
class SearchService {
  constructor() {
    this.cache = new Map();
    this.debounceTimeout = null;
    this.searchHistory = [];
  }

  // Debouncing intelligent
  debounceSearch(searchTerm, callback, delay = 300) {
    clearTimeout(this.debounceTimeout);
    this.debounceTimeout = setTimeout(() => {
      this.performSearch(searchTerm, callback);
    }, delay);
  }

  // Recherche avec cache et historique
  async performSearch(term, callback) {
    if (!term.trim()) {
      callback([]);
      return;
    }

    // Vérifier le cache
    if (this.cache.has(term)) {
      callback(this.cache.get(term));
      return;
    }

    try {
      // Appel API avec indicateur de chargement
      callback({ loading: true });
      
      const response = await fetch(`/api/contacts/search?q=${encodeURIComponent(term)}`);
      const results = await response.json();
      
      // Mettre en cache
      this.cache.set(term, results);
      
      // Ajouter à l'historique
      this.addToHistory(term);
      
      callback(results);
    } catch (error) {
      callback({ error: error.message });
    }
  }

  addToHistory(term) {
    this.searchHistory.unshift(term);
    this.searchHistory = this.searchHistory.slice(0, 10); // Garder 10 dernières recherches
  }
}

// 2. COMPOSANT REACT AVANCÉ
const AdvancedSearchComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  
  const searchService = useRef(new SearchService());

  // Recherche avec debouncing
  const handleSearch = (term) => {
    setSearchTerm(term);
    setLoading(true);
    
    searchService.current.debounceSearch(term, (data) => {
      if (data.loading) {
        setLoading(true);
      } else if (data.error) {
        setResults([]);
        setLoading(false);
      } else {
        setResults(data.contacts || []);
        setLoading(false);
      }
    });
  };

  // Suggestions en temps réel
  const handleInputChange = async (value) => {
    handleSearch(value);
    
    if (value.length >= 2) {
      const response = await fetch(`/api/contacts/suggestions?q=${encodeURIComponent(value)}`);
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } else {
      setSuggestions([]);
    }
  };

  return (
    <div className="search-container">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder="Rechercher des contacts..."
        className="search-input"
      />
      
      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          {suggestions.map((suggestion, index) => (
            <div 
              key={index}
              className="suggestion-item"
              onClick={() => {
                setSearchTerm(suggestion.value);
                handleSearch(suggestion.value);
                setSuggestions([]);
              }}
            >
              {suggestion.value}
              <span className="suggestion-count">({suggestion.count})</span>
            </div>
          ))}
        </div>
      )}
      
      {/* Résultats */}
      <div className="search-results">
        {loading && <div className="loading">Recherche en cours...</div>}
        {results.map(contact => (
          <div key={contact.id} className="contact-item">
            {contact.full_name} - {contact.current_company_subindustry}
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. API BACKEND OPTIMISÉE
app.get('/api/contacts/search', async (req, res) => {
  const { q, page = 1, limit = 20, sort = 'relevance' } = req.query;
  
  try {
    const startTime = Date.now();
    
    // Recherche avec ranking de pertinence
    const result = await pool.query(`
      SELECT 
        c.*,
        -- Score de pertinence
        (
          CASE WHEN LOWER(c.current_company_name) LIKE $1 THEN 3 ELSE 0 END +
          CASE WHEN LOWER(c.current_company_industry) LIKE $1 THEN 2 ELSE 0 END +
          CASE WHEN LOWER(c.current_company_subindustry) LIKE $1 THEN 4 ELSE 0 END +
          CASE WHEN LOWER(c.full_name) LIKE $1 THEN 1 ELSE 0 END
        ) as relevance_score
      FROM contacts c
      WHERE 
        LOWER(c.current_company_name) LIKE $2 OR
        LOWER(c.current_company_industry) LIKE $2 OR
        LOWER(c.current_company_subindustry) LIKE $2 OR
        LOWER(c.full_name) LIKE $2
      ORDER BY 
        relevance_score DESC,
        c.lead_quality_score DESC,
        c.created_at DESC
      LIMIT $3 OFFSET $4
    `, [
      `%${q}%`, // Pour le score de pertinence
      `%${q}%`, // Pour la recherche
      parseInt(limit),
      (parseInt(page) - 1) * parseInt(limit)
    ]);
    
    const searchTime = Date.now() - startTime;
    
    res.json({
      contacts: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.rows.length,
        searchTime
      },
      query: q,
      suggestions: await getSearchSuggestions(q)
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Erreur de recherche' });
  }
});

// 4. SUGGESTIONS INTELLIGENTES
app.get('/api/contacts/suggestions', async (req, res) => {
  const { q } = req.query;
  
  if (!q || q.length < 2) {
    return res.json({ suggestions: [] });
  }
  
  try {
    // Suggestions basées sur la fréquence
    const result = await pool.query(`
      SELECT 
        current_company_subindustry as value,
        COUNT(*) as count,
        'subindustry' as type
      FROM contacts 
      WHERE current_company_subindustry ILIKE $1
      GROUP BY current_company_subindustry
      ORDER BY count DESC, current_company_subindustry ASC
      LIMIT 5
      
      UNION ALL
      
      SELECT 
        current_company_industry as value,
        COUNT(*) as count,
        'industry' as type
      FROM contacts 
      WHERE current_company_industry ILIKE $1
      GROUP BY current_company_industry
      ORDER BY count DESC, current_company_industry ASC
      LIMIT 5
    `, [`%${q}%`]);
    
    res.json({ suggestions: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Erreur suggestions' });
  }
});

// 5. INDEX DE PERFORMANCE
/*
-- Index pour recherche rapide
CREATE INDEX CONCURRENTLY idx_contacts_search_optimized 
ON contacts USING gin (
  to_tsvector('french', 
    COALESCE(current_company_name, '') || ' ' ||
    COALESCE(current_company_industry, '') || ' ' ||
    COALESCE(current_company_subindustry, '') || ' ' ||
    COALESCE(full_name, '')
  )
);

-- Index trigramme pour recherche partielle
CREATE INDEX CONCURRENTLY idx_contacts_trgm_search 
ON contacts USING gin (
  current_company_name gin_trgm_ops,
  current_company_industry gin_trgm_ops,
  current_company_subindustry gin_trgm_ops
);
*/
