const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'index.html';
}

const portfolioTableBody = document.getElementById('portfolioTableBody');
const companySelect = document.getElementById('companySelect');
const buySharesForm = document.getElementById('buySharesForm');
const buyMessage = document.getElementById('buyMessage');
const logoutBtn = document.getElementById('logoutBtn');

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  window.location.href = 'index.html';
});

async function fetchPortfolio() {
  try {
    const response = await fetch('/api/portfolio', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await response.json();
    renderPortfolio(data.portfolio);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
  }
}

function renderPortfolio(portfolio) {
  portfolioTableBody.innerHTML = '';
  portfolio.forEach(item => {
    const tr = document.createElement('tr');
    tr.classList.add('border-b', 'border-gray-300');
    const totalValue = (item.quantity * item.currentPrice).toFixed(2);
    tr.innerHTML = `
      <td class="border border-gray-300 px-4 py-2">${item.companyName}</td>
      <td class="border border-gray-300 px-4 py-2">${item.quantity}</td>
      <td class="border border-gray-300 px-4 py-2">${item.currentPrice.toFixed(2)}</td>
      <td class="border border-gray-300 px-4 py-2">${totalValue}</td>
    `;
    portfolioTableBody.appendChild(tr);
  });
}

async function fetchCompanies() {
  try {
    const response = await fetch('/api/companies');
    const companies = await response.json();
    renderCompanyOptions(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
  }
}

function renderCompanyOptions(companies) {
  companySelect.innerHTML = '';
  companies.forEach(company => {
    if (company.sharesAvailable > 0) {
      const option = document.createElement('option');
      option.value = company.id;
      option.textContent = `${company.name} - Precio: $${company.price.toFixed(2)} - Acciones disponibles: ${company.sharesAvailable}`;
      companySelect.appendChild(option);
    }
  });
}

buySharesForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  buyMessage.classList.add('hidden');
  buyMessage.textContent = '';

  const companyId = parseInt(companySelect.value);
  const quantity = parseInt(document.getElementById('quantity').value);

  if (!companyId || quantity <= 0) {
    buyMessage.textContent = 'Por favor, seleccione una empresa y una cantidad válida.';
    buyMessage.classList.remove('hidden');
    return;
  }

  try {
    const response = await fetch('/api/buy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ companyId, quantity })
    });
    const data = await response.json();
    if (!response.ok) {
      buyMessage.textContent = data.message || 'Error al comprar acciones.';
      buyMessage.classList.remove('hidden');
      return;
    }
    buyMessage.textContent = 'Compra exitosa!';
    buyMessage.classList.remove('hidden');
    buySharesForm.reset();
    fetchPortfolio();
    fetchCompanies();
  } catch (error) {
    buyMessage.textContent = 'Error de conexión.';
    buyMessage.classList.remove('hidden');
  }
});

// Initial load
fetchPortfolio();
fetchCompanies();
