import './index.css'

function App() {
  console.log('Simple App is loading...')

  try {
    return (
      <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
        <h1 style={{ color: 'black' }}>React App is Working!</h1>
        <p style={{ color: 'blue' }}>If you can see this, React is running.</p>
        <button
          onClick={() => alert('Button clicked!')}
          style={{ padding: '10px', backgroundColor: 'blue', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          Click Me
        </button>
      </div>
    )
  } catch (error) {
    console.error('Error in App component:', error)
    return <div>Error occurred. Check console.</div>
  }
}

export default App