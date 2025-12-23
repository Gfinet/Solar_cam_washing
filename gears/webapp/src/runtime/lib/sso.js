module.exports.init = async function (app) {
	async function getProviderOptions(id) {
		const provider = await app.db.models.SAMLProvider.byId(id);
		if (provider) {
			const result = { ...provider.getOptions() };
			// @node-saml@4 renamed `cert` to `idpCert`
			result.idpCert = result.cert;
			delete result.cert;
			return result;
		}
		return null;
	}

	async function getProviderForEmail(email) {
		const provider = await app.db.models.SAMLProvider.forEmail(email);
		if (provider) {
			return provider.hashid;
		}
		return null;
	}

	async function isSSOEnabledForEmail(email) {
		return !!(await getProviderForEmail(email));
	}

	/**
	 * Handle a request POST /account/login to see if SSO should be triggered
	 * @returns whether the request has been handled or not
	 */
	async function handleLoginRequest(request, reply) {
		const user = await app.db.models.User.byUsernameOrEmail(request.body.username);
		if (user) {
			// TODO: hardcoded
			//const providerConfig = await app.db.models.SAMLProvider.forEmail(user.email)
			const providerConfig = user.email.endsWith("@student.s19.be") ? { type: "42" } : null;
			if (providerConfig) {
				if (providerConfig.type === "42") {
					if (request.body.username.toLowerCase() !== user.email.toLowerCase() || request.body.password) {
						// A SSO enabled user has tried to login with their username, or have provided a password.
						// If they are an admin, allow them to continue - we need to let admins bypass SSO so they
						// cannot be locked out.
						if (user.admin) {
							return false;
						}
						// We need them to provide just their email address to avoid
						// us exposing their email domain
						reply.code(401).send({ code: "sso_required", error: "Please login with your email address" });
					} else {
						reply.code(401).send({ code: "sso_required", redirect: `/sso/login/42` });
					}
					return true;
				}
			}
		} else {
			// should check if username is email address?
			/*const providerConfig = await app.db.models.SAMLProvider.forEmail(request.body.username)
            if (providerConfig?.options?.provisionNewUsers) {
                if (providerConfig.type === 'saml') {
                    reply.code(401).send({ code: 'sso_required', redirect: `/sso/login?u=${request.body.username}` })
                    return true
                }
            }*/
		}
		return false;
	}

	return {
		handleLoginRequest,
		isSSOEnabledForEmail,
		getProviderOptions,
		getProviderForEmail,
	};
};
