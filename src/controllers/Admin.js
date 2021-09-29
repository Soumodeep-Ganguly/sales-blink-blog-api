// Required Libraries
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const moment = require("moment");

const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET;
moment().format();
moment.suppressDeprecationWarnings = true;

// Required Models 
const User = require("../models/UserModel");
const Post = require("../models/PostModel");
const Comment = require("../models/CommentModel");

module.exports = {

	/// Start User ///

	// User login
	login: function (req, res) {
		const errors = validationResult(req);
		// Checking fields validation errors
		if (Object.keys(errors.array()).length > 0) {
			res.status(200).send({
				status: "validation_error",
				errors: errors.array(),
			});
		} else {
			console.log(req.body.email);
			var where = {};
			where["email"] = req.body.email;
			// Getting user according to email
			User.findOne(where)
				.then((user) => {
					if(user == null){
						res.status(200).send({
							status: "error",
							message: "User not found",
						});
						return;
					}

					if(user.active == 0){
						res.status(200).send({
							status: "error",
							message: "Account is inactive",
						});
						return;
					}

					// Validating password
					bcryptjs.compare(
						req.body.password,
						user.password,
						function (err, result) {
							if (result == true) {
								const accessToken = jwt.sign({
										email: req.body.email
									},
									JWT_SECRET, {
										expiresIn: "31000000s"
									}
								);
								res.status(200).send({
									status: "success",
									message: "Logged in",
									token: accessToken,
									result: user,
								});
							} else {
								res.status(200).send({
									status: "error",
									message: "Invalid password",
								});
							}
						}
					);
				})
				.catch((error) => {
					console.log(error);
					res.status(200).send({
						status: "error",
						message: "Invalid email",
					});
				});
		}
	},

	// Create User
	create_user: function (req, res) {
        const errors = validationResult(req);
		// Checking fields validation errors
		if (Object.keys(errors.array()).length > 0) {
			res.status(200).send({
				status: "validation_error",
				errors: errors.array(),
			});
            return;
		}

		var where = {};
		where["mobile"] = req.body.mobile;
		// Checking user mobile number
		User.findOne(where)
			.then((response) => {
				if (response != null) {
					res.status(200).send({
						status: "error",
						message: "Mobile already in use.",
					});
				} else {
					var where = {};
					where["email"] = req.body.email;
					// Checking user email
					User.findOne(where)
						.then((response) => {
							if (response != null) {
								res.status(200).send({
									status: "error",
									message: "Email address already in use.",
								});
							} else {
								// // Generating password salt
								bcryptjs.genSalt(saltRounds, (err, salt) => {
									// Hashing password
									bcryptjs.hash(req.body.password, salt, (err, hash) => {
										var userData = new User({
											full_name: req.body.full_name,
											email: req.body.email,
											mobile: req.body.mobile,
											password: hash,
                                            user_type: "user",
											created_date: moment().format()
										});
		
										userData.save(function (err, savedUser) {
											if (err) {
												res.status(200).send({
													status: "error",
													message: err,
												});
											} else {
												res.status(200).send({
													status: "success",
													message: "Account has been created successfully.",
													data: savedUser,
												});
											}
										});
									});
								});
							}
						})
						.catch((error) => {
							res.status(200).send({
								status: "error",
								message: "Invalid email",
							});
						});
				}
			})
			.catch((error) => {
				res.status(200).send({
					status: "error",
					message: "Invalid mobile",
				});
			});
	},

	/// Start Post ///

	add_post: function (req, res) {
		const errors = validationResult(req);
		// Checking fields validation errors
		if (Object.keys(errors.array()).length > 0) {
			res.status(200).send({
				status: "validation_error",
				errors: errors.array(),
			});
		} else {
			var where = {};
            where["_id"] = req.body.user;
			where["deleted"] = 0;
			// Checking user
			User.findOne(where)
				.then((response) => {
					if (response == null) {
						res.status(200).send({
							status: "error",
							message: "User not found.",
						});
					} else {
						var where = {};
                        where["user"] = req.body.user;
                        where["title"] = req.body.title;
                        where["deleted"] = 0;
                        // Checking post
                        Post.findOne(where)
                            .then((response) => {
                                if (response != null) {
                                    res.status(200).send({
                                        status: "error",
                                        message: "Post with same title exist.",
                                    });
                                } else {
                                    var postData = new Post({
                                        title: req.body.title,
                                        details: req.body.details,
                                        image: req.body.image,
                                        user: req.body.user,
                                        created_date: moment().format()
                                    });

                                    postData.save(function (err, savedUser) {
                                        if (err) {
                                            res.status(200).send({
                                                status: "error",
                                                message: err,
                                            });
                                        } else {
                                            res.status(200).send({
                                                status: "success",
                                                message: "Post has been added successfully.",
                                                data: savedUser,
                                            });
                                        }
                                    });
                                }
                            })
                            .catch((error) => {
                                res.status(200).send({
                                    status: "error",
                                    message: "Invalid post",
                                });
                            });
					}
				})
				.catch((error) => {
					res.status(200).send({
						status: "error",
						message: "Invalid post",
					});
				});
		}
	},

	post_list: function (req, res) {
		var where = {};
		where["deleted"] = 0;
        if(req.body.user && req.body.user != ""){
            where['user'] = req.body.user;
        }
		Post.find(where)
		.sort({
			created_date: -1
		})
		.populate('user', 'full_name')
			.then((response) => {
				res.status(200).send({
					status: "success",
					result: response
				});
			})
			.catch((error) => {
				res.status(200).send({
					status: "error",
					message: error,
				});
			});
	},

	single_post: function (req, res) {
		var where = {};
		where["deleted"] = 0;
        where['_id'] = req.body.id;
		Post.findOne(where)
		.populate('user', 'full_name')
			.then((response) => {
				Comment.find({ post: req.body.id, deleted: 0 })
				.sort({
					created_date: -1
				})
				.populate("user", 'full_name')
				.then(comments => {
					res.status(200).send({
						status: "success",
						result: response,
						comments: comments
					});
				}).catch((error) => {
					res.status(200).send({
						status: "error",
						message: error
					});
				});
			})
			.catch((error) => {
				res.status(200).send({
					status: "error",
					message: error
				});
			});
	},

    update_post: function (req, res) {
		var where = {};
		where["_id"] = req.body.id;
        where["user"] = req.body.user;
		Post.findOneAndUpdate(
				where, {
                    title: req.body.title,
					details: req.body.details,
                    image: req.body.image,
				}, {
					new: true
				}
			)
			.exec()
			.then((response) => {
				res.status(200).send({
					status: "success",
					message: "Post has been updated"
				});
			})
			.catch((error) => {
				res.status(200).send({
					status: "error",
					message: "Something went wrong"
				});
			});
	},

	delete_post: function (req, res) {
		var where = {};
		where["_id"] = req.body.id;
        where["user"] = req.body.user;
		Post.findOneAndUpdate(
				where, {
					deleted: 1,
				}, {
					new: true
				}
			)
			.exec()
			.then((response) => {
				res.status(200).send({
					status: "success",
					message: "Post has been deleted"
				});
			})
			.catch((error) => {
				res.status(200).send({
					status: "error",
					message: "Something went wrong"
				});
			});
	},

	/// End Post ///

	/// Start Comment ///

	add_comment: function (req, res) {
		const errors = validationResult(req);
		// Checking fields validation errors
		if (Object.keys(errors.array()).length > 0) {
			res.status(200).send({
				status: "validation_error",
				errors: errors.array(),
			});
		} else {
			var where = {};
            where["_id"] = req.body.user;
			where["deleted"] = 0;
			// Checking user
			User.findOne(where)
				.then((response) => {
					if (response == null) {
						res.status(200).send({
							status: "error",
							message: "User not found.",
						});
					} else {
						var where = {};
                        where["_id"] = req.body.post;
                        where["deleted"] = 0;
                        // Checking post
                        Post.findOne(where)
                            .then((response) => {
                                if (response == null) {
                                    res.status(200).send({
                                        status: "error",
                                        message: "Post with same title exist.",
                                    });
                                } else {
                                    var commentData = new Comment({
                                        comment: req.body.comment,
                                        post: req.body.post,
                                        user: req.body.user,
                                        created_date: moment().format()
                                    });

                                    commentData.save(function (err, savedUser) {
                                        if (err) {
                                            res.status(200).send({
                                                status: "error",
                                                message: err,
                                            });
                                        } else {
                                            res.status(200).send({
                                                status: "success",
                                                message: "Comment has been added successfully.",
                                                data: savedUser,
                                            });
                                        }
                                    });
                                }
                            })
                            .catch((error) => {
                                res.status(200).send({
                                    status: "error",
                                    message: "Invalid post",
                                });
                            });
					}
				})
				.catch((error) => {
					res.status(200).send({
						status: "error",
						message: "Invalid post",
					});
				});
		}
	},

	/// End Comment ///
}