const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'index.html';
}

const companiesTableBody = document.getElementById('companiesTableBody');
const addCompanyForm = document.getElementById('addCompanyForm');
const logoutBtn = document.getElementById('logoutBtn');

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  window.location.href = 'index.html';
});

async function fetchCompanies() {
  try {
    const response = await fetch('/api/companies');
    const companies = await response.json();
    renderCompanies(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
  }
}

function renderCompanies(companies) {
  companiesTableBody.innerHTML = '';
  companies.forEach(company => {
    const tr = document.createElement('tr');
    tr.classList.add('border-b', 'border-gray-300');

    tr.innerHTML = `
      <td class="border border-gray-300 px-4 py-2">${company.name}</td>
      <td class="border border-gray-300 px-4 py-2">
        <input type="number" min="0" value="${company.sharesAvailable}" data-id="${company.id}" class="shares-input w-full px-2 py-1 border rounded" />
      </td>
      <td class="border border-gray-300 px-4 py-2">${company.price.toFixed(2)}</td>
      <td class="border border-gray-300 px-4 py-2 text-center">
        <button data-id="${company.id}" class="remove-btn bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition">
          <i class="fas fa-trash-alt"></i>
        </button>
      </td>
    `;
    companiesTableBody.appendChild(tr);
  });

  // Add event listeners for shares input change
  document.querySelectorAll('.shares-input').forEach(input => {
    input.addEventListener('change', async (e) => {
      const companyId = parseInt(e.target.getAttribute('data-id'));
      const sharesAvailable = parseInt(e.target.value);
      if (sharesAvailable < 0) {
        alert('Las acciones disponibles no pueden ser negativas.');
        fetchCompanies();
        return;
      }
      try {
        const response = await fetch('/api/admin/companies/' + companyId + '/shares', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ sharesAvailable })
        });
        if (!response.ok) {
          alert('Error al actualizar las acciones.');
          fetchCompanies();
        }
      } catch (error) {
        alert('Error de conexión.');
        fetchCompanies();
      }
    });
  });

  // Add event listeners for remove buttons
  document.querySelectorAll('.remove-btn').forEach(button => {
    button.addEventListener('click', async (e) => {
      const companyId = parseInt(e.target.closest('button').getAttribute('data-id'));
      if (!confirm('¿Está seguro de eliminar esta empresa?')) return;
      try {
        const response = await fetch('/api/admin/companies/' + companyId, {
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer ' + token
          }
        });
        if (response.ok) {
          fetchCompanies();
        } else {
          alert('Error al eliminar la empresa.');
        }
      } catch (error) {
        alert('Error de conexión.');
      }
    });
  });
}

addCompanyForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('companyName').value.trim();
  const sharesAvailable = parseInt(document.getElementById('sharesAvailable').value);
  const price = parseFloat(document.getElementById('price').value);

  if (!name || sharesAvailable <= 0 || price <= 0) {
    alert('Por favor, complete todos los campos correctamente.');
    return;
  }

  try {
    const response = await fetch('/api/admin/companies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ name, sharesAvailable, price })
    });
    if (response.ok) {
      addCompanyForm.reset();
      fetchCompanies();
    } else {
      alert('Error al agregar la empresa.');
    }
  } catch (error) {
    alert('Error de conexión.');
  }
});

// Initial load
fetchCompanies();
