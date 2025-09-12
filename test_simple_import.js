import fetch from 'node-fetch';

async function testImport() {
  const testData = [
    {
      "lead_id": 999999,
      "full_name": "Test Simple",
      "headline": "Test Headline",
      "current_exp_company_name": "Test Company",
      "current_exp_company_industry": "Test Industry",
      "experiences": [
        {
          "company_name": "Test Company",
          "title": "Test Title",
          "is_current": true
        }
      ]
    }
  ];

  try {
    console.log('🚀 Test d\'import simple...');
    const response = await fetch('http://localhost:3003/api/contacts/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ jsonData: testData })
    });
    
    const result = await response.json();
    console.log('📊 Résultat:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testImport();
