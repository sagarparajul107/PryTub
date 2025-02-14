const LocationService = {
    init() {
        if (!localStorage.getItem('anonymousLocation')) {
            this.setAnonymousLocation();
        }
    },

    setAnonymousLocation() {
        try {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    () => {
                        localStorage.setItem('anonymousLocation', 'anonymous');
                    },
                    () => {
                        localStorage.setItem('anonymousLocation', 'worldwide');
                    },
                    { 
                        timeout: 5000,
                        enableHighAccuracy: false,
                        maximumAge: 24 * 60 * 60 * 1000 // 24 hours
                    }
                );
            } else {
                localStorage.setItem('anonymousLocation', 'worldwide');
            }
        } catch (error) {
            localStorage.setItem('anonymousLocation', 'worldwide');
        }
    }
};

let termsAccepted = false;

function updateAcceptButton() {
    const termsChecked = document.getElementById('termsCheck').checked;
    const privacyChecked = document.getElementById('privacyCheck').checked;
    const disclaimerChecked = document.getElementById('disclaimerCheck').checked;
    
    document.getElementById('acceptButton').disabled = !(termsChecked && privacyChecked && disclaimerChecked);
}

function acceptEducationalTerms() {
    const termsChecked = document.getElementById('termsCheck').checked;
    const privacyChecked = document.getElementById('privacyCheck').checked;
    const disclaimerChecked = document.getElementById('disclaimerCheck').checked;
    
    if (termsChecked && privacyChecked && disclaimerChecked) {
        localStorage.setItem('isReturningUser', 'true');
        localStorage.setItem('eduTermsAccepted', 'true');
        document.getElementById('educationalPopup').classList.add('hidden');
    }

    if (document.getElementById('educationalCheck').checked &&
        document.getElementById('termsCheck').checked &&
        document.getElementById('ageCheck').checked &&
        document.getElementById('consentCheckbox').checked) {
        termsAccepted = true;
        document.getElementById('popup').classList.add('hidden');
    }
}

function checkEducationalTerms() {
    const isReturningUser = localStorage.getItem('isReturningUser');
    const accepted = localStorage.getItem('eduTermsAccepted');
    if (!isReturningUser && !accepted) {
        document.getElementById('educationalPopup').classList.remove('hidden');
    }
}

function getYouTubeId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

function createFrames() {
    if (!termsAccepted) {
        alert('Please accept the educational terms first by clicking the Continue button.');
        showPopup();
        return;
    }

    const frameCount = parseInt(document.getElementById('frameCount').value) || 1;
    const videoUrl = document.getElementById('videoUrl').value;
    
    if (!videoUrl) {
        alert('Please enter a valid YouTube URL');
        return;
    }

    const container = document.getElementById('grid-container');
    container.innerHTML = '';

    // Calculate grid layout
    const cols = frameCount <= 2 ? frameCount : Math.ceil(Math.sqrt(frameCount));
    container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    // Create frames with autoplay enabled
    for (let i = 0; i < frameCount; i++) {
        const frame = document.createElement('div');
        frame.className = 'video-frame';
        
        const videoId = extractVideoId(videoUrl);
        if (videoId) {
            frame.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1" frameborder="0" allowfullscreen allow="autoplay"></iframe>`;
        }
        
        container.appendChild(frame);
    }
}

function clearFrames() {
    document.getElementById('grid-container').innerHTML = '';
    document.getElementById('videoUrl').value = '';
    document.getElementById('frameCount').value = '1';
}

function extractVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

window.onload = () => {
    document.getElementById('frameCount').value = '1';
    checkEducationalTerms();
    
    // Add checkbox event listeners
    document.getElementById('termsCheck').addEventListener('change', updateAcceptButton);
    document.getElementById('privacyCheck').addEventListener('change', updateAcceptButton);
    document.getElementById('disclaimerCheck').addEventListener('change', updateAcceptButton);
};

document.addEventListener('DOMContentLoaded', function() {
    // Check if user has already accepted terms
    const hasAcceptedTerms = localStorage.getItem('termsAccepted') === 'true';
    
    if (!hasAcceptedTerms) {
        showPopup();
    } else {
        termsAccepted = true;
        hidePopup();
    }
    
    // Check if this is a first-time user
    const isFirstTimeUser = !localStorage.getItem('termsAccepted');
    
    if (isFirstTimeUser) {
        showPopup();
    } else {
        termsAccepted = true;
    }
    
    document.getElementById('continueButton').addEventListener('click', function() {
        if (validateCheckboxes()) {
            termsAccepted = true;
            localStorage.setItem('termsAccepted', 'true');
            hidePopup();
        }
    });
    
    // Enable/disable continue button based on checkboxes
    const checkboxes = ['educationalCheck', 'termsCheck', 'ageCheck', 'consentCheckbox'];
    checkboxes.forEach(id => {
        document.getElementById(id).addEventListener('change', updateContinueButton);
    });
});

function validateCheckboxes() {
    const checkboxIds = ['educationalCheck', 'termsCheck', 'ageCheck', 'consentCheckbox'];
    return checkboxIds.every(id => document.getElementById(id).checked);
}

function updateContinueButton() {
    const allChecked = ['educationalCheck', 'termsCheck', 'ageCheck', 'consentCheckbox']
        .every(id => document.getElementById(id).checked);
    document.getElementById('continueButton').disabled = !allChecked;
}

function showPopup() {
    document.getElementById('popup').classList.remove('hidden');
}

function hidePopup() {
    document.getElementById('popup').classList.add('hidden');
}
