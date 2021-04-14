export default {
  jwt: {
    secret: process.env.JWT_SECRET as string || 'secretPassword',
    expiresIn: '1d'
  }
}
