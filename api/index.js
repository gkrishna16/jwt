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

	const user = users.find((u) => {
		return u.username === username && u.password === password;
	});
	if (!user) {
		res.status(404).json('Username or password invalid.');
	}

	const accessToken = generateAccessToken(user);
	const refreshToken = generateRefreshToken(user);
	refreshTokens.push(refreshToken);

	res.status(200).json({
		username: username,
		id: user.id,
		isAdmin: user.isAdmin,
		refreshToken: refreshToken,
		accessToken: accessToken,
	});
});

app.post('/api/refresh', (req, res) => {
	const refreshToken = req.body.token;

	if (!refreshToken) return res.sendStatus(401);
	if (!refreshTokens.includes(refreshToken)) return res.sendStatus(401);

	jwt.verify(refreshToken, 'myRefreshToken', (err, user) => {
		if (err) console.error(err);
		refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

		const newAccessToken = generateAccessToken(user);
		const newRefreshToken = generateAccessToken(user);
		refreshTokens.push(newRefreshToken);
		res.json({
			newAccessToken: newAccessToken,
			newRefreshToken: newRefreshToken,
		});
	});
});

app.delete('/api/users/:userId', verifyUser, (req, res) => {
	if (req.user.id === req.params.userId || req.user.isAdmin) {
		res.send('User has been deleted');
	} else {
		res.status(403).json('You are not authorized.');
	}
});

function verifyUser(req, res, next) {
	const authHeader = req.headers['authorization'];
	const token = authHeader.split(' ')[1];

	if (!token) return res.status(401).json('The token is not present.');
	jwt.verify(token, 'mySecretKey', (err, user) => {
		if (err) return res.status(401).json('The token is not valid.');
		req.user = user;
		next();
	});
}

function generateAccessToken(user) {
	return jwt.sign(
		{ id: user.id, username: user.username, isAdmin: user.isAdmin },
		'mySecretKey',
		{
			expiresIn: '15m',
		},
	);
}
function generateRefreshToken(user) {
	return jwt.sign(
		{ id: user.id, username: user.username, isAdmin: user.isAdmin },
		'myRefreshToken',
	);
}

app.post('/api/logout', verifyUser, (req, res) => {
	const refreshToken = req.body.token;
	!refreshToken && res.status(401);

	refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
	res.status(200).json('Logged Out.');
});
// app.post('/api/login', (req, res) => {
// 	const { username, password } = req.body;

// 	const user = users.find(
// 		(u) => u.username === username && u.password === password,
// 	);
// 	if (!user)
// 		return res.status(401).json({ message: 'Username or password invalid.' });

// 	const accessToken = generateAccessToken(user);
// 	const refreshToken = generateRefreshToken(user);
// 	refreshTokens.push(refreshToken);

// 	res.status(200).json({
// 		username: user.username,
// 		isAdmin: user.isAdmin,
// 		accessToken: accessToken,
// 		refreshToken: refreshToken,
// 	});
// });

// app.post('/api/refresh', (req, res) => {
// 	const refreshToken = req.body.token;

// 	if (!refreshToken) return res.setStatus(401).json('You are not authorized.');
// 	if (!refreshTokens.includes(refreshToken))
// 		return res.status(403).json('The token is not valid');

// 	jwt.verify(refreshToken, 'myRefreshKey', (err, user) => {
// 		err && console.log(err);

// 		refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
// 		const newAccessToken = generateAccessToken(user);
// 		const newRefreshToken = generateRefreshToken(user);
// 		refreshTokens.push(newRefreshToken);
// 		res.json({
// 			newAccessToken: newAccessToken,
// 			newRefreshToken: newRefreshToken,
// 		});
// 	});
// });

// function generateAccessToken(user) {
// 	return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, 'mySecretKey', {
// 		expiresIn: '15m',
// 	});
// }

// function generateRefreshToken(user) {
// 	return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, 'myRefreshKey');
// }

// app.delete('/api/users/:userId', verify, (req, res) => {
// 	if (req.params.userId === req.user.id || req.user.isAdmin) {
// 		res.json('User has been deleted.');
// 	} else {
// 		res.status(403).json('You are not authorized.');
// 	}
// });

// function verify(req, res, next) {
// 	const authHeader = req.headers['authorization'];
// 	const token = authHeader.split(' ')[1];

// 	if (!token) return res.status(401);
// 	jwt.verify(token, 'mySecretKey', (err, user) => {
// 		if (err) return res.status(403).json('The token is not valid');
// 		req.user = user;
// 		next();
// 	});
// }

// app.post('/api/logout', verify, (req, res) => {
// 	const refreshToken = req.body.token;
// 	refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
// 	res.json('You logged out successfully.');
// });
app.listen(port, () => {
	console.log(`server running on port ${port}`);
});
