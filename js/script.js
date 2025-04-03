// Timer functionality for gait speed calculations
class Timer {
    constructor(display) {
        this.display = display;
        this.running = false;
        this.startTime = 0;
        this.elapsedTime = 0;
        this.intervalId = null;
    }

    start() {
        if (!this.running) {
            this.running = true;
            this.startTime = Date.now() - this.elapsedTime;
            this.intervalId = setInterval(() => {
                this.updateDisplay();
            }, 100); // Update every 100ms for smooth 0.1s precision
        }
    }

    stop() {
        if (this.running) {
            this.running = false;
            clearInterval(this.intervalId);
            this.elapsedTime = Date.now() - this.startTime;
            return this.elapsedTime / 1000; // Return elapsed time in seconds
        }
        return this.elapsedTime / 1000;
    }

    reset() {
        this.running = false;
        clearInterval(this.intervalId);
        this.elapsedTime = 0;
        this.updateDisplay();
    }

    updateDisplay() {
        const currentTime = this.running ? Date.now() - this.startTime : this.elapsedTime;
        const seconds = currentTime / 1000;
        this.display.textContent = seconds.toFixed(1); // Display with one decimal place
    }
}

// Normative values for gait speed by age and gender
const maleNormativeValues = {
    '20-29': 4.46,
    '30-39': 4.7,
    '40-49': 4.7,
    '50-59': 4.7,
    '60-69': 4.39,
    '70-79': 4.14,
    '80-89': 3.18,
    '90-99': 3.18,
    '100': 2.1
};

const femaleNormativeValues = {
    '20-29': 4.4,
    '30-39': 4.39,
    '40-49': 4.56,
    '50-59': 4.31,
    '60-69': 4.07,
    '70-79': 3.71,
    '80-89': 3.09,
    '90-99': 3.09,
    '100': 2.1
};

// Calculation functions
function calculateGaitMetrics(distance, time, steps, ageCategory, gender) {
    // Validate inputs
    if (distance <= 0 || time <= 0 || steps <= 0) {
        throw new Error('All values must be greater than zero');
    }
    
    // Calculate metrics
    const gaitSpeed = distance / time; // feet per second
    const stepLength = distance / steps; // feet per step
    const cadence = (60 / time) * steps; // steps per minute
    
    // Calculate percent disability
    let percentDisability = 0;
    const normativeValues = gender === 'male' ? maleNormativeValues : femaleNormativeValues;
    
    if (normativeValues[ageCategory]) {
        percentDisability = 1 - (gaitSpeed / normativeValues[ageCategory]);
        // Ensure disability percentage is not negative (if person is faster than normative value)
        percentDisability = Math.max(0, percentDisability);
    }
    
    return {
        gaitSpeed: parseFloat(gaitSpeed.toFixed(2)),
        stepLength: parseFloat(stepLength.toFixed(2)),
        cadence: Math.ceil(cadence), // Round up to nearest integer
        percentDisability: Math.round(percentDisability * 100) // Convert to percentage and round to nearest integer
    };
}

document.addEventListener('DOMContentLoaded', function() {
    const timeDisplay = document.getElementById('time-display');
    const startBtn = document.getElementById('start-timer');
    const stopBtn = document.getElementById('stop-timer');
    const resetBtn = document.getElementById('reset-timer');
    const calculationForm = document.getElementById('gait-calculation-form');
    const timeInput = document.getElementById('time');
    const resultsSection = document.getElementById('results-section');
    
    // Create a new timer instance
    const timer = new Timer(timeDisplay);
    
    // Timer control buttons
    startBtn.addEventListener('click', function() {
        timer.start();
        startBtn.classList.add('d-none');
        stopBtn.classList.remove('d-none');
    });
    
    stopBtn.addEventListener('click', function() {
        const elapsedTime = timer.stop();
        timeInput.value = elapsedTime.toFixed(1);
        startBtn.classList.remove('d-none');
        stopBtn.classList.add('d-none');
    });
    
    resetBtn.addEventListener('click', function() {
        timer.reset();
        timeInput.value = "0.0";
        startBtn.classList.remove('d-none');
        stopBtn.classList.add('d-none');
    });
    
    // Form submission
    calculationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // If timer is still running, stop it
        if (timer.running) {
            const elapsedTime = timer.stop();
            timeInput.value = elapsedTime.toFixed(1);
            startBtn.classList.remove('d-none');
            stopBtn.classList.add('d-none');
        }
        
        try {
            // Get form data
            const distance = parseFloat(document.getElementById('distance').value);
            const time = parseFloat(document.getElementById('time').value);
            const steps = parseInt(document.getElementById('steps').value);
            const ageCategory = document.getElementById('age_category').value;
            
            // Get selected gender
            const genderRadios = document.getElementsByName('gender');
            let gender = '';
            for (const radio of genderRadios) {
                if (radio.checked) {
                    gender = radio.value;
                    break;
                }
            }
            
            // Validate age and gender selection
            if (!ageCategory) {
                throw new Error('Please select an age category');
            }
            
            if (!gender) {
                throw new Error('Please select a gender');
            }
            
            // Calculate metrics
            const results = calculateGaitMetrics(distance, time, steps, ageCategory, gender);
            
            // Display results
            displayResults(results);
        } catch (error) {
            showError(error.message || 'An error occurred while calculating. Please try again.');
            console.error('Error:', error);
        }
    });
    
    function displayResults(data) {
        // Clear any previous errors
        document.getElementById('error-message').classList.add('d-none');
        
        // Display results
        document.getElementById('gait-speed-result').textContent = data.gaitSpeed + ' ft/sec';
        document.getElementById('step-length-result').textContent = data.stepLength + ' ft/step';
        document.getElementById('cadence-result').textContent = data.cadence + ' steps/min';
        document.getElementById('disability-result').textContent = data.percentDisability + '%';
        
        // Show results section
        resultsSection.classList.remove('d-none');
        
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    function showError(message) {
        const errorElement = document.getElementById('error-message');
        errorElement.textContent = message;
        errorElement.classList.remove('d-none');
        resultsSection.classList.add('d-none');
    }
    
    // Input validation
    document.getElementById('distance').addEventListener('input', function(e) {
        const value = e.target.value.trim();
        if (value && !/^\d+$/.test(value)) {
            e.target.classList.add('is-invalid');
        } else {
            e.target.classList.remove('is-invalid');
        }
    });
    
    document.getElementById('steps').addEventListener('input', function(e) {
        const value = e.target.value.trim();
        if (value && !/^\d+$/.test(value)) {
            e.target.classList.add('is-invalid');
        } else {
            e.target.classList.remove('is-invalid');
        }
    });
    
    timeInput.addEventListener('input', function(e) {
        const value = e.target.value.trim();
        if (value && !/^\d*\.?\d*$/.test(value)) {
            e.target.classList.add('is-invalid');
        } else {
            e.target.classList.remove('is-invalid');
        }
    });
});
