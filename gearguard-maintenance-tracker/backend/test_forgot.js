const API = 'http://localhost:5000'

async function post(path, body){
  const res = await fetch(`${API}${path}`, {
    method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body)
  })
  const data = await res.json().catch(()=>null)
  console.log(path, 'status', res.status, 'data', data)
  return { res, data }
}

async function run(){
  // create user
  const email = `fp_test_${Date.now()}@example.test`
  await post('/api/auth/register', { name: 'FP Test', email, password: 'StrongP@ss1', rePassword: 'StrongP@ss1' })
  // request otp
  await post('/api/auth/forgot', { email })
}

run().catch(e=>{ console.error(e); process.exit(1) })
