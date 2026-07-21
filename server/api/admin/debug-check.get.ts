export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const pwd = config.adminPassword

  return {
    exists: !!pwd,
    length: pwd ? pwd.length : 0,
    firstChar: pwd ? pwd.charAt(0) : null,
    lastChar: pwd ? pwd.charAt(pwd.length - 1) : null
  }
})