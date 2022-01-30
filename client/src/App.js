import React, { useState } from 'react';
import axios from 'axios';

import './App.css';

function App() {
	const [user, setUser] = useState(null);
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState(false);
	const [success, setSuccess] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const res = await axios.post('/login', { username, password });
			setUser(res.data);
		} catch (error) {
			console.log(error);
		}
	};
	const handleDelete = () => {};
	return (
		<div className="container">
			{user ? (
				<div className="home">
					<span>
						Welcome to the <b>{user.isAdmin ? 'admin' : 'user'}</b> dashboard
						<b>{user.username}</b>.
					</span>
					<span>Delete Users:</span>
					<button className="deleteButton" onClick={() => handleDelete(1)}>
						Delete John
					</button>
					<button className="deleteButton" onClick={() => handleDelete(2)}>
						Delete Jane
					</button>
					{error && (
						<span className="error">
							You are not allowed to delete this user!
						</span>
					)}
					{success && (
						<span className="success">
							User has been deleted successfully...
						</span>
					)}
				</div>
			) : (
				<div className="login">
					<form onSubmit={handleSubmit}>
						<span className="formTitle">Gopal Login</span>
						<input
							type="text"
							placeholder="username"
							onChange={(e) => setUsername(e.target.value)}
						/>
						<input
							type="password"
							placeholder="password"
							onChange={(e) => setPassword(e.target.value)}
						/>
						<button type="submit" className="submitButton">
							Login
						</button>
					</form>
				</div>
			)}
		</div>
	);
}

export default App;
