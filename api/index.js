require('dotenv').config();
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const port = 5002;

app.use(express.json());

const users = [
	{ id: '1', username: 'john', password: 'John0908', isAdmin: true },
	{ id: '2', username: 'jane', password: 'Jane0908', isAdmin: false },
];

app.get('/', (req, res) => {
	res.status(200).json(`Be brave Gopal.`);
});

app.post('/api/login', (req, res) => {
	// const { username, password } = req.body;
	const username = req.body.username;
	const password = req.body.password;

	const user = users.find(
		(u) => u.username === username && u.password === password,
	);
	try {
		if (user) {
			const accessToken = createNewAccessToken(user);
			const refreshToken = createNewRefreshToken(user);

			res.status(200).json({
				id: user.id,
				isAdmin: user.isAdmin,
				accessToken: accessToken,
				refreshToken: refreshToken,
			});
		}
	} catch (error) {
		console.log(error);
	}
});

app.delete('/api/users/:userId', verify, (req, res) => {
	try {
		if (req.user.id === req.params.userId || req.user.isAdmin) {
			res.status(200).json(`User has been deleted.`);
		} else {
			res.status(403).json(`You are not allowed to delete the user.`);
		}
	} catch (error) {
		console.log(error);
	}
});

function verify(req, res, next) {
	const authHeader = req.headers['authorization'];

	if (authHeader) {
		const token = authHeader.split(' ')[1];
		jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
			if (err) return res.status(403).json(`Token is not valid`);
			req.user = user;
			next();
		});
	} else {
		res.status(401).json(`You are not authenticated.`);
	}
}

function createNewAccessToken(user) {
	return jwt.sign(
		{ id: user.id, isAdmin: user.isAdmin },
		process.env.SECRET_KEY,
	);
}
function createNewRefreshToken(user) {
	return jwt.sign(
		{ id: user.id, isAdmin: user.isAdmin },
		process.env.REFRESH_KEY,
	);
}

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
