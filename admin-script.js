async function fetchRegistrations() {
    const tableBody = document.getElementById('registrationsTable');
    const errorDiv = document.getElementById('error');
    
    try {
        // Show loading state
        tableBody.innerHTML = '<tr><td colspan="5" class="loading">Loading registrations...</td></tr>';
        
        const response = await fetch('http://localhost:3000/registrations');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Fetched registrations:', result); // Debug log

        if (!result.success) {
            throw new Error(result.message || 'Failed to fetch registrations');
        }

        if (!result.data || result.data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="loading">No registrations found</td></tr>';
            return;
        }

        tableBody.innerHTML = result.data.map(registration => {
            // Format the attendance date - display it directly since it's stored as a string
            const attendanceDate = registration.attendance_date || 'Tanggal tidak tersedia';

            // Format registration date
            let registrationDate;
            try {
                registrationDate = new Date(registration.registration_date).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            } catch (error) {
                registrationDate = 'Tanggal tidak tersedia';
            }

            // Format created date
            let createdDate;
            try {
                createdDate = new Date(registration.created_at).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            } catch (error) {
                createdDate = 'Tanggal tidak tersedia';
            }

            return `
                <tr>
                    <td>${registration.full_name}</td>
                    <td>${registration.phone_number}</td>
                    <td>${attendanceDate}</td>
                    <td>${registrationDate}</td>
                    <td>${createdDate}</td>
                </tr>
            `;
        }).join('');

        errorDiv.style.display = 'none';
    } catch (error) {
        console.error('Error fetching registrations:', error);
        errorDiv.textContent = `Failed to load registrations: ${error.message}`;
        errorDiv.style.display = 'block';
        tableBody.innerHTML = '<tr><td colspan="5" class="loading">Error loading data</td></tr>';
    }
}

// Add click event listener to refresh button
document.addEventListener('DOMContentLoaded', () => {
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', fetchRegistrations);
    }
    
    // Initial fetch
    fetchRegistrations();
}); 