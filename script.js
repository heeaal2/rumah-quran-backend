// Set minimum date to today when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('attendance_date');
    dateInput.min = new Date().toISOString().split('T')[0];
});

async function validateForm(event) {
    event.preventDefault();
    
    const fullName = document.getElementById('full_name').value;
    const phoneNumber = document.getElementById('phone_number').value;
    const attendanceDate = document.getElementById('attendance_date').value;

    // Validate date is not in the past
    const selectedDate = new Date(attendanceDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
        alert('Please select a future date');
        return false;
    }

    try {
        console.log('Submitting registration:', { fullName, phoneNumber, attendanceDate }); // Debug log

        const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                full_name: fullName,
                phone_number: phoneNumber,
                attendance_date: attendanceDate
            })
        });

        const result = await response.json();
        console.log('Server response:', result); // Debug log
        
        if (result.success) {
            alert('Registration successful!');
            document.getElementById('registrationForm').reset();
            // Reset min date to today
            const dateInput = document.getElementById('attendance_date');
            dateInput.min = new Date().toISOString().split('T')[0];
        } else {
            alert(result.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Error submitting registration:', error);
        alert('Registration failed. Please try again.');
    }
    
    return false;
}