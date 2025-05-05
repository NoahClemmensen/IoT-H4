$(document).ready(function () {
    $('#settingsForm').on('submit', function (event) {
        event.preventDefault(); // Prevent the default form submission

        // Get the form data
        const formData = $(this).serialize();

        // Send the form data to the server using AJAX
        $.ajax({
            type: 'POST',
            url: '/settings/save',
            data: formData,
            success: function (response) {
                // Handle success response
                alert('Settings saved successfully!');
            },
            error: function (error) {
                // Handle error response
                alert('Error saving settings. Please try again.');
            }
        });
    });

    $('#addStaffForm').on('submit', function (event) {
        event.preventDefault(); // Prevent the default form submission

        // Get the staff name from the input field
        const staffName = $('#staff_name').val();
        console.log(staffName);

        // Send the staff name to the server using AJAX
        $.ajax({
            type: 'POST',
            url: '/staff/new/' + staffName,
            success: function (response) {
                // Handle success response
                alert('Staff added successfully!');
                // Optionally, refresh the page or update the UI
                location.reload();
            },
            error: function (error) {
                // Handle error response
                alert('Error adding staff. Please try again.');
            }
        });
    });

    $('#addKeywordForm').on('submit', function (event) {
        event.preventDefault(); // Prevent the default form submission

        // Get the keyword from the input field
        const keycard_uid = $('#keycard_uid').val();
        console.log(keycard_uid);

        // Send the keyword to the server using AJAX
        $.ajax({
            type: 'POST',
            url: '/keycard/new/' + keycard_uid,
            success: function (response) {
                // Handle success response
                alert('Keycard added successfully!');
                // Optionally, refresh the page or update the UI
                location.reload();
            },
            error: function (error) {
                // Handle error response
                alert('Error adding keycard. Please try again.');
            }
        });
    })
})

function deleteStaff(staffId) {
    $.ajax({
        type: 'DELETE',
        url: '/staff/delete/' + staffId,
        success: function (response) {
            // Handle success response
            alert('Staff deleted successfully!');
            // Optionally, refresh the page or update the UI
            location.reload();
        },
        error: function (error) {
            // Handle error response
            alert('Error deleting staff. Please try again.');
        }
    });
}

function deleteKeycard(uid) {
    $.ajax({
        type: 'DELETE',
        url: '/keycard/delete/' + uid,
        success: function (response) {
            // Handle success response
            alert('Keycard deleted successfully!');
            // Optionally, refresh the page or update the UI
            location.reload();
        },
        error: function (error) {
            // Handle error response
            alert('Error deleting keycard. Please try again.');
        }
    });
}

function saveStaff(id) {
    console.log(id);
    const staffName = $('#name-'+id).val();
    console.log(staffName);
    const keycard_uid = $('#keycard-'+id).val();
    console.log(keycard_uid);
}
