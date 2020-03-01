import React, { Component } from "react";
import { Modal, Button, Checkbox, Input, Select, Form } from "antd";
import style from "./index.module";
import countryCode from "common/js/country-code";
import http from "apis/http";
import apisPaths from "apis/paths";
import {createAjax, errorMessage} from "common/js/utils";
import {withRouter} from "react-router-dom";

class Auth extends Component {
	constructor(props) {
		super(props);
		this.state = {
			status: 1, // 1 -> 登录； 2 -> 手机号登录； 3 -> 手机号注册1； 4 -> 手机号注册2； 5 -> 手机号注册3； 6 -> 手机号注册4； 7 -> 重设密码1；8 -> 重设密码2；
			agree: false,
			phoneCode: "86",
			phone: "",
			password: "",
			remember_login: 1,
			loading: false,
			showTips: false,
			hasPhone: false,
			hasPassword: false,
			releaseTime: 60,
			username: "",
			captcha: "",
			resetPassword: false
		};
		this.captcha1 = React.createRef();
		this.captcha2 = React.createRef();
		this.captcha3 = React.createRef();
		this.captcha4 = React.createRef();
		this.setStatus = this.setStatus.bind(this);
		this.changePolicy = this.changePolicy.bind(this);
		this.changeAutoLogin = this.changeAutoLogin.bind(this);
		this.setPhoneCode = this.setPhoneCode.bind(this);
		this.setPhone = this.setPhone.bind(this);
		this.setPassword = this.setPassword.bind(this);
		this.showPassWordTips = this.showPassWordTips.bind(this);
		this.checkPhone3 = this.checkPhone3.bind(this);
		this.checkPassword3 = this.checkPassword3.bind(this);
		this.register = this.register.bind(this);
		this.refresh = this.refresh.bind(this);
		this.handleSubmit2 = this.handleSubmit2.bind(this);
		this.handleSubmit3 = this.handleSubmit3.bind(this);
		this.handleSubmit5 = this.handleSubmit5.bind(this);
		this.interval = null;
	}
	setStatus(status) {
		return () => {
			this.setState(this.resetState(status));
		};
	}
	setModalTitle() {
		switch (this.state.status) {
			case 1:
				return "登录";
			case 2:
				return "手机号登录";
			case 3:
			case 4:
			case 5:
			case 6:
				return "手机号注册";
			case 7:
			case 8:
				return "重设密码";
			default:
				return "";
		}
	}
	createFooter() {
		if (this.state.status == 1 || this.state.status == 6) {
			return null;
		} else if (this.state.status == 2) {
			return (
				<div className={style["modalFooter"] + " " + style["clearfix"]}>
					<div className={style["returnLogin"] + " fl"} onClick={this.setStatus(1)}>
						&lt; 其他登录方式
					</div>
					<div className={style["turnRegister"] + " fr"} onClick={this.setStatus(3)}>
						没有账号？免费注册 &gt;
					</div>
				</div>
			);
		} else {
			return (
				<div className={style["modalFooter"] + " " + style["clearfix"]}>
					<div className={style["returnLogin"] + " fl"} onClick={this.setStatus(1)}>
						返回登录
					</div>
				</div>
			);
		}
	}
	changePolicy(e) {
		this.setState({
			agree: e.target.checked
		});
	}
	changeAutoLogin(e) {
		this.setState({
			remember_login: e.target.checked ? 1 : 0
		});
	}
	checkPolicy(status) {
		return () => {
			if (!this.state.agree) {
				errorMessage("请先勾选同意《服务条款》、《隐私政策》、《儿童隐私政策》")
				return;
			}
			this.setState({
				status
			});
		};
	}
	handleSubmit2(e) {
		e.preventDefault()
		this.props.form.validateFields((err, values) => {
			if(!err) {
				this.setState({
					loading: true
				});
				const successCallback = res => {
					this.props.switchAuthModal(false)
					this.setState({
						loading: false
					});
				}
				const failCallback = res => {
					errorMessage(res.data.msg)
					this.setState({
						loading: false
					});
				}
				const errCallback = error => {
					if (error.response) {
						errorMessage(error.response.data)
					} else if (error.request) {
						errorMessage(error.request)
					} else {
						errorMessage(error.message)
					}
					this.setState({
						loading: false
					});
				}
				this.props.loginCellphone({
					phone: this.state.phone,
					password: this.state.password,
					countrycode: this.state.phoneCode
				}, successCallback, failCallback, errCallback)
			}
		})
	}
	getCaptcha() {
		this.interval = setInterval(() => {
			var releaseTime = this.state.releaseTime
			if(releaseTime <= 0) {
				clearInterval(this.interval)
				this.setState({
					releaseTime: 60
				})
				return
			}
			this.setState({
				releaseTime: releaseTime-1
			})
		}, 1000)
		createAjax(http.post(apisPaths["captcha/sent"], {
			phone: this.form.getFieldValue("phone")
		}))
	}
	handleSubmit3(e) {
		e.preventDefault()
		this.props.form.validateFields((err, values) => {
			if(!err) {
				var newState = Object.assign({}, {
					status: this.state.status == 7 ? 8 : 4,
					phone: this.form.getFieldValue("phone")
				}, this.state.status == 7 ? {resetPassword: true} : {})
				this.setState(newState)
				this.getCaptcha()
			}
		})
	}
	handleSubmit5(e) {
		e.preventDefault()
		this.props.form.validateFields((err, values) => {
			if(!err) {
				this.setState({
					loading: true
				})
				this.props.registerCellphone({
					phone: this.state.phone,
					password: this.state.password,
					captcha: this.state.captcha,
					nickname: this.state.nickname
				}, res => {
					this.refresh()
				}, res => {
					errorMessage(res.data.msg)
					this.setState({
						loading: false
					})
				})
			}
		})
	}
	setPhoneCode(e) {
		this.setState({
			phoneCode: e.target.value
		});
	}
	setPhone(e) {
		this.setState({
			phone: e.target.value
		});
	}
	setPassword(e) {
		this.setState({
			password: e.target.value
		});
	}
	checkPhone3(e) {
		if (!/^1(3|4|5|6|7|8|9)\d{9}$/.test(e.target.value)) {
			this.setState({
				hasPhone: true
			})
			this.setPhone(e)
		}else {
			this.setState({
				hasPhone: false
			})
		}
	}
	checkPassword3(e) {
		var checkSpace = this.checkSpace(e.target.value)
		var checkLength = this.checkLength(e.target.value)
		var checkFormat = this.checkFormat(e.target.value)
		if(checkSpace && checkLength && checkFormat) {
			this.setState({
				hasPassword: true
			})
			this.setPassword(e)
		}else {
			this.setState({
				hasPassword: false
			})
		}
	}
	showPassWordTips() {
		this.setState({
			showTips: true
		})
	}
	checkSpace(password) {
		return password.test(/\s/g) ? "red" : ""
	}
	checkFormat(password) {
		var test1 = /(\d)/g.test(password)
		var test2 = /[a-z]/gi.test(password)
		var test3 = /\S\D[^a-z]/gi.test(password)
		var arr = [test1, test2, test3]
		var newarr = arr.filter(function(item) {
			return item
		})
		return newarr.length >= 2 ? "red" : ""
	}
	checkLength(password) {
		return (password.length < 6 || password.length > 16) ? "red" : ""
	}
	hidePhone(phone) {
		var arr = phone.split("");
		arr.splice(3,4,"*","*","*","*")
		var str = arr.join("")
		return str
	}
	nextInput(e, index) {
		return () => {
			e.target.value = e.target.value.replace(/\s/, "")
			if(e.target.value.length == 1) {
				if(index) {
					this["password"+index].current.focus()
				}else {
					this.register()
				}
			}
		}
	}
	register() {
		if(this.captcha1.current.value == "" || this.captcha2.current.value == "" || this.captcha3.current.value == "" || this.captcha4.current.value == "") {
			errorMessage("请输入验证码");
			return;
		}
		this.setState({
			loading: true
		})
		createAjax(http.post(apisPaths["captcha/verify"], {
			phone: this.state.phone,
			captcha: this.captcha1.current.value + this.captcha2.current.value + this.captcha3.current.value + this.captcha4.current.value
		}), res => {
			this.setState({
				captcha: this.captcha1.current.value + this.captcha2.current.value + this.captcha3.current.value + this.captcha4.current.value
			})
			createAjax(http.post(apisPaths["cellphone/existence/check"], {
				phone: this.state.phone
			}), res => {
				if(res.data.exist == 1) { //已注册
					this.props.registerCellphone({
						phone: this.state.phone,
						password: this.state.password,
						captcha: this.state.captcha
					}, res => {
						if(this.state.resetPassword) {
							this.refresh()
						}else {
							this.setState({
								status: 6,
								username: res.data.profile.nickname
							})
						}
					})
				}else { //未注册
					this.setState({
						status: 5
					})
				}
			})
		}, () => {
			this.setState({
				loading: false
			})
		}, () => {
			this.setState({
				loading: false
			})
		})
	}
	refresh() {
		this.props.switchAuthModal(false)
		this.props.refreshPage(!this.props.is_refresh_page)
	}
	closeModal() {
		if(this.state.status == 6) {
			this.props.refreshPage(!this.props.is_refresh_page)
		}
		this.setState(this.resetState())
	}
	getLength(rule, value, callback) {
		value = value.replace(/\s/, "");
		var realLength = 0, len = value.length, charCode = -1;
		for (var i = 0; i < len; i++) {
			charCode = value.charCodeAt(i);
			if (charCode >= 0 && charCode <= 128)
				realLength += 1;
			else
				realLength += 2;
		}
		if(realLength < 4) {
			callback("昵称不少于4个字母或2个汉字")
		}
		callback()
	}
	resetState(status = 1) {
		return {
			status, 
			agree: false,
			phoneCode: "86",
			phone: "",
			password: "",
			remember_login: 1,
			loading: false,
			hasPhone: false,
			hasPassword: false,
			releaseTime: 60,
			username: "",
			captcha: "",
			resetPassword: false
		}
	}
	static getDerivedStateFromProps = (props, state) => {
		if(props.authModalVisibility == false) {
			return {
				status, 
				agree: false,
				phoneCode: "86",
				phone: "",
				password: "",
				remember_login: 1,
				loading: false,
				hasPhone: false,
				hasPassword: false,
				releaseTime: 60,
				username: "",
				captcha: "",
				resetPassword: false
			}
		}
		return null
	}
	render() {
		const InputGroup = Input.Group;
		const { Option } = Select;
		const {form} = this.props;
		const {getFieldDecorator} = form;
		const optionItems = countryCode.map((item, index) => {
			return (
				<Option value={item.code.substring(1)}>
					{item.cn} {item.code}
				</Option>
			);
		});
		return (
			<Modal
				title={this.setModalTitle()}
				footer={this.createFooter()}
				visible={this.props.authModalVisibility}
				maskStyle={{
					background: "none"
				}}
				wrapClassName={style.authModal}
				onCancel={this.closeModal}
			>
				{this.state.status == 1 && (
					<div className={style["modal_content"]}>
						<div className={style["modal_1_btngroup"]}>
							<img src={require("./images/platform.png")} />
							<Button type="primary" onClick={this.checkPolicy(2)} block>
								手机号登录
							</Button>
							<Button type="default" onClick={this.setStatus(3)} block>
								注册
							</Button>
						</div>
						<div className={style["modal_1_privacy"]}>
							<Checkbox onChange={this.changePolicy}>
								同意 
								<a
									target="_blank"
									href="http://st.music.163.com/official-terms/service"
								>
									《服务条款》
								</a> 
								<a
									target="_blank"
									href="http://st.music.163.com/official-terms/privacy"
								>
									《隐私政策》
								</a> 
								<a
									target="_blank"
									href="https://st.music.163.com/official-terms/children"
								>
									《儿童隐私政策》
								</a>
							</Checkbox>
						</div>
					</div>
				)}
				{this.state.status == 2 && (
					<div className={style["modal_content"]}>
						<Form onSubmit={this.handleSubmit2}>
							<div className={style["modal_2_inputgroup"]}>
								<Form.Item>
									<InputGroup compact>
										<Select defaultValue={this.state.phoneCode} onChange={this.setPhoneCode}>
											{optionItems}
										</Select>
										{
											getFieldDecorator("phone", {
												rules: [{
													required: true,
													message: "请输入手机号码"
													},{
													type: /^1(3|4|5|6|7|8|9)\d{9}$/,
													message: "请输入正确的手机号"
												}]
											})(<Input placeholder="请输入手机号" />)
										}
										<Input placeholder="请输入手机号" onChange={this.setPhone} />
									</InputGroup>
								</Form.Item>
								<br />
								<Form.Item>
									{
										getFieldDecorator("password", {
											rules: [{
												required: true,
												message: "请输入登录密码"
											}]
										})(<Input.Password placeholder="请输入密码" autocomplete="off" />)
									}
								</Form.Item>
							</div>
							<div className="clearfix">
								<div className="fl">
									<Form.Item>
										<Checkbox onChange={this.changeAutoLogin}>自动登录 </Checkbox>
									</Form.Item>
								</div>
								<div className="fr">
									<a href="javascript:;" onClick={this.setStatus(7)}>
										忘记密码？
									</a>
								</div>
							</div>
							<br />
							<Form.Item>
								<Button type="primary" htmlType="submit" loading={this.state.loading} block>
									登录
								</Button>
							</Form.Item>
						</Form>
					</div>
				)}
				{(this.state.status == 3 || this.state.status == 7) && (
					<div className={style["modal_content"]}>
						<Form onSubmit={this.handleSubmit3}>
							<div className={style["modal_3_inputgroup"]}>
								<p>手机号：</p> 
								<Form.Item>
									<InputGroup compact>
										<Select defaultValue={this.state.phoneCode} onChange={this.setPhoneCode}>
											{optionItems}
										</Select>
										{
											getFieldDecorator("phone", {
												rules: [{
													required: true,
													message: "请输入手机号码"
													},{
													type: /^1(3|4|5|6|7|8|9)\d{9}$/,
													message: "请输入正确的手机号"
												}]
											})(<Input placeholder="请输入手机号" onChange={this.checkPhone3} />)
										}
									</InputGroup>
								</Form.Item>
								<p>密码：</p> 
								<Form.Item>
									{
										getFieldDecorator("password", {})(<Input.Password
											placeholder="设置登录密码，不少于6位"
											autocomplete="off"
											onChange={this.checkPassword3}
											onFocus={this.showPassWordTips}
										/>)
									}
								</Form.Item>
								<p style={{display: this.state.showTips ? "block" : "none"}} className={this.checkSpace(form.getFieldValue("password"))}>密码不能包含空格</p> 
								<p style={{display: this.state.showTips ? "block" : "none"}} className={this.checkFormat(form.getFieldValue("password"))}>包含字母、数字、符号中至少两种</p> 
								<p style={{display: this.state.showTips ? "block" : "none"}} className={this.checkLength(form.getFieldValue("password"))}>密码长度为6-16位</p> 
							</div>
							<Button type="primary" htmlType="submit" disabled={!this.hasPhone || !this.hasPassword} block>
								下一步
							</Button>
						</Form>
					</div>
				)}
				{(this.state.status == 4 || this.state.status == 8) && (
					<div className={style["modal_content"]}>
						<p>你的手机号：+{this.state.phoneCode} {this.hidePhone(this.state.phone)}</p> 
						<p>为了安全，我们会给你发送短信验证码</p>
						<div className={style["modal_4_password"]}>
							<Input className={style["modal_4_captcha"]} ref={this.captcha1} maxLength="1" onChange={e => this.nextInput(e, 2)} />
							<Input className={style["modal_4_captcha"]} ref={this.captcha2} maxLength="1" onChange={e => this.nextInput(e, 3)} />
							<Input className={style["modal_4_captcha"]} ref={this.captcha3} maxLength="1" onChange={e => this.nextInput(e, 4)} />
							<Input className={style["modal_4_captcha"]} ref={this.captcha4} maxLength="1" onChange={e => this.nextInput(e)} />
						</div> 
						<div className={style["modal_4_captcha"] + " clearfix"}>
							{
								this.state.releaseTime <= 0 && (
									<div className={style["modal_4_getCaptcha"] + " fr blue"} onClick={this.getCaptcha}>重新获取</div>
								)
							}
							{
								this.state.releaseTime > 0 && (
									<div className={style["modal_4_countdown"] + " fr blue"}>{this.state.releaseTime}S</div>
								)
							}
						</div>
						<Button type="primary" loading={this.state.loading} onClick={this.register} block>
							下一步
						</Button>
					</div>
				)}
				{this.state.status == 5 && (
					<div className={style["modal_content"]}>
						<Form onSubmit={this.handleSubmit5}>
							<p>取一个名称，让大家记住你</p>
							<Form.Item>
								{
									getFieldDecorator("nickname", {
										rules: [{
											required: true,
											message: "请输入昵称"
										},{
											validator: this.getLength
										}]
									})(<Input placeholder="昵称不少于4个字母或2个汉字" />)
								}
							</Form.Item>
							<Button type="primary" htmlType="submit" loading={this.state.loading} block>
								开启云音乐
							</Button>
						</Form>
					</div>
				)}
				{this.state.status == 6 && (
					<div className={style["modal_content"]}>
						<p>改手机号已与云音乐账号 <b>{this.state.username}</b> 绑定，</p> 
						<p>以后你可以直接用改手机号+密码登录</p>
						<Button type="primary" onClick={this.refresh} block>
							知道了
						</Button>
					</div>
				)}
			</Modal>
		);
	}
}

export default Form.create({name: "auth"})(withRouter(Auth));



