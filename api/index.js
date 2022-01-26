const { application } = require('express');
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
app.use(express.json());

const users = [
	{ id: '1', username: 'john', password: 'John0908', isAdmin: true },
	{ id: '2', username: 'jane', password: 'Jane0908', isAdmin: false },
];

app.post('/api/login', (req, res) => {
	const { username, password } = req.body;
	try {
		const user = users.find((u) => {
			return u.username === username && u.password === password;
		});

		if (user) {
			const accessToken = jwt.sign(
				{
					username: user.username,
					isAdmin: user.isAdmin,
				},
				'e905a340-14dc-411f-aee6-182bc4231ad0',
			);
			res
				.status(200)
				.json({ username: user.username, isAdmin: user.isAdmin, accessToken });
		} else {
			res.status(401).json('Username or password is incorrect.');
		}
	} catch (error) {
		console.log(error);
	}
});

const verify = (req, res, next) => {
	const authHeader = req.headers['authorization'];
	if (authHeader) {
		const token = authHeader.split(' ')[1];

		jwt.verify(token, 'e905a340-14dc-411f-aee6-182bc4231ad0', (err, user) => {
			if (err) {
				return res.status(403).json('Token is not valid!');
			}

			req.user = user;
			next();
		});
	} else {
		res.status(401).json('You are not authenticated!');
	}
};

app.delete('/api/users/:userId', verify, (req, res, next) => {
	if (req.user.id === req.params.userId || req.user.isAdmin) {
		res.status(200).json('The user has been deleted.');
	} else {
		res.status(401).status('You are not authorized to delete this user.');
	}
	console.log(error);
});

app.listen(5002, () => {
	console.log(`Backend server is running.`);
});

// app.post('/api/login', (req, res) => {
// 	const { username, password } = req.body;
// 	const user = users.find((u) => {
// 		return u.username === username && u.password === password;
// 	});
// 	if (user) {
// 		const accessToken = jwt.sign(
// 			{
// 				username: user.username,
// 				isAdmin: user.isAdmin,
// 			},
// 			'mySecretKey',
// 		);

// 		res
// 			.status(200)
// 			.json({ username: user.username, isAdmin: user.isAdmin, accessToken });
// 	} else {
// 		res.status(400).json('Username or Password is incorrect.');
// 	}
// });

// app.delete('/api/users/:userId', verify, (req, res) => {
// 	if (req.user.id === req.params.userId || req.user.isAdmin) {
// 		res.status(200).json('User has been deleted.');
// 	} else {
// 		res.status(403).json('You are not allowed to delete this user!');
// 	}
// });