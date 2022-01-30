// const { application } = require('express');
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
app.use(express.json());

const port = 3000;

const users = [
	{ id: '1', username: 'john', password: 'John0908', isAdmin: true },
	{ id: '2', username: 'jane', password: 'Jane0908', isAdmin: false },
];

let refreshTokens = [];

app.post('/api/login', (req, res) => {
	const { username, password } = req.body;

	const user = users.find(
		(u) => u.username === username && u.password === password,
	);
	if (!user)
		return res
			.setStatus(401)
			.json({ message: 'Username or password invalid.' });

	const accessToken = generateAccessToken(user);
	const refreshToken = generateRefreshToken(user);
	refreshTokens.push(refreshToken);

	res.status(200).json({
		username: user.username,
		accessToken: accessToken,
		refreshToken: refreshToken,
	});
});

app.post('/api/refresh', (req, res) => {
	const refreshToken = req.body.token;

	if (!refreshToken) return res.setStatus(401).json('You are not authorized.');
	if (!refreshTokens.includes(refreshToken))
		return res.json('The token is not valid');

	jwt.verify(refreshToken, 'myRefreshKey', (err, user) => {
		err && console.log(err);

		refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

		const newAccessToken = generateAccessToken(user);
		const newRefreshToken = generateRefreshToken(user);
		refreshTokens.push(newRefreshToken);
		res.json({
			newAccessToken: newAccessToken,
			newRefreshToken: newRefreshToken,
		});
	});
});

function generateAccessToken(user) {
	return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, 'mySecretKey');
}

function generateRefreshToken(user) {
	return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, 'myRefreshKey');
}

app.delete('/api/delete/:userId', verify, (req, res) => {
	if (req.params.id === req.user.id || req.user.isAdmin) {
		res.json('User has been deleted.');
	} else {
		res.json('You are not authorized.');
	}
});

function verify(req, res, next) {
	const authHeader = req.headers['authorization'];
	const token = authHeader.split(' ')[1];

	if (!token) return res.setStatus(401);
	jwt.verify(token, 'mySecretKey', (err, user) => {
		if (err) return res.status(403).json('The token is not valid');

		req.user = user;
		next();
	});
}

app.post('/api/logout', verify, (req, res) => {
	const refreshToken = req.body.token;
	refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
	res.json('You logged out successfully.');
});
app.listen(port, () => {
	console.log(`server running on port ${port}`);
});
