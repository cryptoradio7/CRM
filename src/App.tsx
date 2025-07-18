import React, { useState } from 'react';
import './App.css';

interface Page {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

function App() {
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [newPageTitle, setNewPageTitle] = useState('');

  const createPage = () => {
    if (newPageTitle.trim()) {
      const newPage: Page = {
        id: Date.now().toString(),
        title: newPageTitle,
        content: '',
        createdAt: new Date()
      };
      setPages([...pages, newPage]);
      setNewPageTitle('');
    }
  };

  const selectPage = (page: Page) => {
    setCurrentPage(page);
  };

  const updatePageContent = (content: string) => {
    if (currentPage) {
      const updatedPage = { ...currentPage, content };
      setCurrentPage(updatedPage);
      setPages(pages.map(p => p.id === currentPage.id ? updatedPage : p));
    }
  };

  const goBack = () => {
    setCurrentPage(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>BLOCKS - Éditeur de Pages</h1>
      </header>

      <main className="App-main">
        {!currentPage ? (
          <div className="pages-list">
            <div className="create-page">
              <h2>Créer une nouvelle page</h2>
              <div className="input-group">
                <input
                  type="text"
                  value={newPageTitle}
                  onChange={(e) => setNewPageTitle(e.target.value)}
                  placeholder="Titre de la page"
                  onKeyPress={(e) => e.key === 'Enter' && createPage()}
                />
                <button onClick={createPage}>Créer</button>
              </div>
            </div>

            <div className="existing-pages">
              <h2>Pages existantes</h2>
              {pages.length === 0 ? (
                <p>Aucune page créée</p>
              ) : (
                <div className="pages-grid">
                  {pages.map(page => (
                    <div key={page.id} className="page-card" onClick={() => selectPage(page)}>
                      <h3>{page.title}</h3>
                      <p>Créée le: {page.createdAt.toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="page-editor">
            <div className="editor-header">
              <button onClick={goBack} className="back-button">← Retour</button>
              <h2>{currentPage.title}</h2>
            </div>
            <textarea
              value={currentPage.content}
              onChange={(e) => updatePageContent(e.target.value)}
              placeholder="Contenu de votre page..."
              className="content-editor"
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App; 