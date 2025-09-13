"use strict";
// Version optimisée de la recherche de contacts
// Remplace la route de recherche existante pour de meilleures performances
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOptimizedSearchRoute = void 0;
const createOptimizedSearchRoute = (app, pool) => {
    // GET - Recherche de contacts (version optimisée)
    app.get('/api/contacts/search', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { q, page = 1, limit = 20 } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            if (!q) {
                return res.json({ contacts: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } });
            }
            const searchTerm = `%${q}%`;
            // Recherche simple et rapide - seulement les contacts de base
            const result = yield pool.query(`
        SELECT 
          c.id,
          c.lead_id,
          c.full_name,
          c.headline,
          c.summary,
          c.location,
          c.country,
          c.connections_count,
          c.lead_quality_score,
          c.linkedin_url,
          c.years_of_experience,
          c.department,
          c.current_title_normalized,
          c.canonical_shorthand_name,
          c.profile_picture_url,
          c.experience_count,
          c.connections_count_bucket,
          c.linkedin_short,
          c.current_company_name,
          c.current_company_industry,
          c.current_company_subindustry,
          c.lead_location_geopoint_array,
          c._score,
          c.created_at,
          c.updated_at
        FROM contacts c
        WHERE LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(c.full_name, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'ë', 'e'), 'à', 'a')) ILIKE LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE($1, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'ë', 'e'), 'à', 'a'))
           OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(c.headline, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'ë', 'e'), 'à', 'a')) ILIKE LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE($1, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'ë', 'e'), 'à', 'a'))
           OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(c.current_company_name, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'ë', 'e'), 'à', 'a')) ILIKE LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE($1, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'ë', 'e'), 'à', 'a'))
           OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(c.location, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'ë', 'e'), 'à', 'a')) ILIKE LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE($1, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'ë', 'e'), 'à', 'a'))
           OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(c.country, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'ë', 'e'), 'à', 'a')) ILIKE LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE($1, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'ë', 'e'), 'à', 'a'))
        ORDER BY c.id DESC
        LIMIT $2 OFFSET $3
      `, [searchTerm, parseInt(limit), offset]);
            // Compter le total des résultats
            const countResult = yield pool.query(`
        SELECT COUNT(*) as total
        FROM contacts c
        WHERE LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(c.full_name, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'ë', 'e'), 'à', 'a')) ILIKE LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE($1, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'ë', 'e'), 'à', 'a'))
           OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(c.headline, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'ë', 'e'), 'à', 'a')) ILIKE LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE($1, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'ë', 'e'), 'à', 'a'))
           OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(c.current_company_name, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'ë', 'e'), 'à', 'a')) ILIKE LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE($1, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'ë', 'e'), 'à', 'a'))
           OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(c.location, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'ë', 'e'), 'à', 'a')) ILIKE LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE($1, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'ë', 'e'), 'à', 'a'))
           OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(c.country, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'ë', 'e'), 'à', 'a')) ILIKE LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE($1, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'ë', 'e'), 'à', 'a'))
      `, [searchTerm]);
            const contacts = result.rows;
            const totalCount = parseInt(countResult.rows[0].total);
            const totalPages = Math.ceil(totalCount / parseInt(limit));
            res.json({
                contacts,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: totalCount,
                    pages: totalPages
                }
            });
        }
        catch (error) {
            console.error('Erreur lors de la recherche de contacts:', error);
            res.status(500).json({ error: 'Erreur serveur lors de la recherche' });
        }
    }));
};
exports.createOptimizedSearchRoute = createOptimizedSearchRoute;
