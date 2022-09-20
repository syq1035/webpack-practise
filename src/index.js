import './index.css';
import './sass.scss' // 引入 Sass 文件

const a = 'Hello!'
console.log(a)

class User {
  name = 'name'
  email = 'email@qq.com'

  info =  () => {
    return {
      name: this.name,
      email: this.email
    }
  }
}


module.exports = User
