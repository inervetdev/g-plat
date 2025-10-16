import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function TestQRPage() {
  const [testResult, setTestResult] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const testQRCodeTable = async () => {
    setLoading(true)
    const results: any = {}

    try {
      // 1. Check if user is authenticated
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      results.userAuth = user ? '✅ User authenticated' : '❌ No user'
      if (userError) results.userError = userError.message

      if (!user) {
        setTestResult(results)
        setLoading(false)
        return
      }

      // 2. Test SELECT on qr_codes table
      const { data: selectData, error: selectError } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('user_id', user.id)

      results.selectTest = selectError ? `❌ SELECT failed: ${selectError.message}` : `✅ SELECT successful (${selectData?.length || 0} records)`

      // 3. Test INSERT on qr_codes table
      // short_code를 10자 이하로 제한
      const timestamp = Date.now().toString(36).slice(-6) // 마지막 6자리만 사용
      const testShortCode = `t${timestamp}`
      const { data: insertData, error: insertError } = await supabase
        .from('qr_codes')
        .insert({
          business_card_id: '', // This would be a valid business card ID in production
          short_code: testShortCode,
          long_url: 'https://example.com/test',
          is_active: true
        } as any)
        .select()
        .single() as any

      results.insertTest = insertError ? `❌ INSERT failed: ${insertError.message}` : '✅ INSERT successful'

      if (insertData) {
        results.insertedId = insertData.id

        // 4. Test UPDATE
        const { error: updateError } = await supabase
          .from('qr_codes')
          .update({ long_url: 'https://example.com/test_updated' })
          .eq('id', insertData.id) as any

        results.updateTest = updateError ? `❌ UPDATE failed: ${updateError.message}` : '✅ UPDATE successful'

        // 5. Test DELETE
        const { error: deleteError } = await supabase
          .from('qr_codes')
          .delete()
          .eq('id', insertData.id)

        results.deleteTest = deleteError ? `❌ DELETE failed: ${deleteError.message}` : '✅ DELETE successful'
      }

      // 6. Check qr_scans table
      const { error: scansError } = await supabase
        .from('qr_scans')
        .select('count')
        .limit(1)

      results.scansTableTest = scansError ? `❌ qr_scans table error: ${scansError.message}` : '✅ qr_scans table accessible'

      // 7. Check analytics view
      const { error: analyticsError } = await supabase
        .from('qr_code_analytics')
        .select('*')
        .limit(1)

      results.analyticsViewTest = analyticsError ? `❌ Analytics view error: ${analyticsError.message}` : '✅ Analytics view accessible'

    } catch (error: any) {
      results.generalError = `❌ General error: ${error.message}`
    }

    setTestResult(results)
    setLoading(false)
  }

  useEffect(() => {
    testQRCodeTable()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">QR Code Database Test</h1>

        <button
          onClick={testQRCodeTable}
          disabled={loading}
          className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Re-run Tests'}
        </button>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Test Results:</h2>

          <div className="space-y-2">
            {Object.entries(testResult).map(([key, value]) => (
              <div key={key} className="flex items-start gap-2">
                <span className="font-mono text-sm text-gray-600">{key}:</span>
                <span className={`text-sm ${String(value).includes('✅') ? 'text-green-600' : String(value).includes('❌') ? 'text-red-600' : 'text-gray-800'}`}>
                  {String(value)}
                </span>
              </div>
            ))}
          </div>

          {Object.keys(testResult).length === 0 && !loading && (
            <p className="text-gray-500">No test results yet. Click the button to run tests.</p>
          )}
        </div>

        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">What this tests:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• User authentication status</li>
            <li>• SELECT permissions on qr_codes table</li>
            <li>• INSERT permissions on qr_codes table</li>
            <li>• UPDATE permissions on qr_codes table</li>
            <li>• DELETE permissions on qr_codes table</li>
            <li>• Access to qr_scans table</li>
            <li>• Access to qr_code_analytics view</li>
          </ul>
        </div>
      </div>
    </div>
  )
}