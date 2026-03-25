import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, LogIn } from 'lucide-react';
import './Login.css';

const ALL_COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador",
  "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini (fmr. 'Swaziland')", "Ethiopia", "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau",
  "Guyana", "Haiti", "Holy See", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq",
  "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait",
  "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico",
  "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (formerly Burma)", "Namibia", "Nauru",
  "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman",
  "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe",
  "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia",
  "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan",
  "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela",
  "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

export function Login({ onLogin }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('United States');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password || (!isLoginMode && !country)) {
      setErrorMsg('All credential fields are required.');
      return;
    }

    const storedData = localStorage.getItem('registeredUsers');
    let users = storedData ? JSON.parse(storedData) : [];

    if (isLoginMode) {
      // Login Flow
      const foundUser = users.find(u => u.email === email && u.password === password);
      if (foundUser) {
        onLogin(foundUser.country);
      } else {
        setErrorMsg('Unauthorized operative or invalid access code.');
      }
    } else {
      // Sign-Up Flow
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        setErrorMsg('Operative email already registered in matrix. Proceed to Login.');
      } else {
        users.push({ email, password, country });
        localStorage.setItem('registeredUsers', JSON.stringify(users));
        setSuccessMsg('Operative registered successfully. Initializing session...');
        setTimeout(() => {
           onLogin(country); // Immediately log them in after sign up
        }, 1000);
      }
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-glow-orb"></div>
      
      <motion.div 
        className="login-card"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
      >
        <div className="login-header">
           <div className="logo-orb large"></div>
           <h2>{isLoginMode ? 'GOE Core Access' : 'Operative Registration'}</h2>
           <p>{isLoginMode ? 'Global Ontology Engine Authentication Interface' : 'Establish unique secure local origin link'}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {errorMsg && <div className="auth-message error">{errorMsg}</div>}
          {successMsg && <div className="auth-message success">{successMsg}</div>}

          <div className="form-group">
            <label>Operative Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="agent@intel.gov" 
            />
          </div>

          <div className="form-group">
            <label>Passphrase</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••" 
            />
          </div>

          {!isLoginMode && ( // Only demand country dropdown actively during Sign-Up!
             <div className="form-group">
               <label>Origin Country / Designation</label>
               <div className="select-wrapper">
                 <select 
                   value={country} 
                   onChange={(e) => setCountry(e.target.value)}
                 >
                   {ALL_COUNTRIES.map(c => <option key={c} value={c} style={{color: '#000'}}>{c}</option>)}
                 </select>
               </div>
             </div>
          )}

          <button type="submit" className="login-btn">
            {isLoginMode ? <LogIn size={18} /> : <ShieldCheck size={18} />}
            <span>{isLoginMode ? 'Initiate Secure Uplink' : 'Register Secure Profile'}</span>
          </button>
        </form>

        <div className="auth-toggle-wrapper">
          <p onClick={() => setIsLoginMode(!isLoginMode)} className="auth-toggle">
             {isLoginMode 
               ? "No registered profile? Register new operative here." 
               : "Already registered? Login via secure uplink here."
             }
          </p>
        </div>

      </motion.div>
    </div>
  );
}
