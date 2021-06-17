//@todo: move to public dir and use lazy loading
//@todo: load users from GitLab (+ add GitHub aliases)

const accounts = [
  {
    "name": "Example Name",
    "email": "email@example.com",
    "emailAliases": {
      "email_alias@example.com": true,
    }
  }
]

let keys = {};
const AT = '@'

accounts.map((account) => {
  account.id = account.email.split(AT)[0]
  keys[account.id] = account

  return account
})

const map = { data: accounts, keys: keys };

export default map