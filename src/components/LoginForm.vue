<template>
  <div class="form-wrapper">
    <form class="custom-form" @submit.prevent="handleLogin">
      <p class="text-form">Login Form</p>
      <div class="form-group">
        <label for="email">Email</label>
        <input
            type="text"
            class="form-control"
            id="email"
            v-model="email"
            placeholder="Enter your email"
            :class="{'invalid': emailError}"
        />
        <p v-if="emailError" class="error-message">{{ emailError }}</p>

        <label for="password">Password</label>
        <input
            type="password"
            class="form-control"
            id="password"
            v-model="password"
            placeholder="Enter your password"
            :class="{'invalid': passwordError}"
        />
        <p v-if="passwordError" class="error-message">{{ passwordError }}</p>
      </div>

      <button type="submit" class="submit-btn">Submit</button>
      <p v-if="locationName">📌 Location: {{ locationName }}</p>
      <p v-if="error" class="login-failed-message">{{ error }}</p>
    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      email: '',
      password: '',
      location: null,
      locationName: null,
      error: null,
      emailError: null,
      passwordError: null,
    };
  },
  methods: {
    async handleLogin() {
      this.emailError = null;
      this.passwordError = null;
      this.error = null;

      if (!this.email) {
        this.emailError = 'Email is required';
      } else if (!this.isValidEmail(this.email)) {
        this.emailError = 'Please enter a valid email address';
      }

      if (!this.password) {
        this.passwordError = 'Password is required';
      }

      if (this.emailError || this.passwordError) {
        return;
      }

      try {
        const response = await axios.post('https://survey.dd-ops.com/api/login', {
          email: this.email,
          password: this.password,
        });

        // Log the response to check if it's successful
        console.log('Login response:', response);

        if (response.data.message === 'Login successful') {
          console.log("/*/*/*/*/");
          localStorage.setItem('authToken', 'true');
          console.log(response)
          const userName = response.data.user?.name || response.data.name;
          console.log(userName);
          if (userName) {
            localStorage.setItem('userName', userName);
          }

          this.$router.push('/surveys');
        }
        else {
          this.error = 'Login failed. Please check your credentials and try again.';
        }
      } catch (err) {
        // Log the error to check if there's an issue with the request
        console.error('Error during login:', err);
        this.error = 'Login failed. Please check your credentials and try again.';
      }
    },

    isValidEmail(email) {
      const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      return emailPattern.test(email);
    },
  },
};
</script>

<style scoped>
/* Full-page wrapper to center content */
.form-wrapper {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #eef1f5;
}

/* Form Styling */
.custom-form {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.text-form {
  margin: 20px;
  text-align: center;
  color: #eb804b;
  font-weight: bold;
  font-size: 40px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 6px;
  font-weight: 600;
  color: #333;
}

.form-control {
  padding: 10px 14px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-control:focus {
  border-color: #eb804b;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  outline: none;
}

.form-control.invalid {
  border-color: #e74c3c; /* Red border */
  background-color: #f8d7da; /* Light red background */
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.3); /* Light red shadow */
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background-color: #eb804b;
  color: white;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn:hover {
  background-color: #eb804b;
}

/* Error message styling for invalid inputs */
.error-message {
  color: #e74c3c; /* Red text */
  font-size: 14px;
  text-align: left;
  margin-top: -12px;
  margin-bottom: 20px;
  font-weight: 600;
  padding-left: 10px;
}

/* Styling for the Login failed message */
.login-failed-message {
  margin-top: 20px;
  padding: 12px;
  background-color: #f8d7da; /* Light red background */
  color: #721c24; /* Dark red text */
  border-radius: 8px;
  border: 1px solid #f5c6cb; /* Light red border */
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  box-shadow: 0 0 8px rgba(231, 76, 60, 0.2); /* Light red shadow */
}

</style>
