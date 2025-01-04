'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export default function MaintenanceManagement() {
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [maintenanceMessage, setMaintenanceMessage] = useState('')

  const toggleMaintenanceMode = () => {
    setMaintenanceMode(!maintenanceMode)
  }

  const saveMaintenanceSettings = () => {
    // ここでAPIを呼び出してサーバーに設定を保存する処理を実装
    console.log('メンテナンスモード:', maintenanceMode)
    console.log('メンテナンスメッセージ:', maintenanceMessage)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">メンテナンス管理</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>メンテナンスモード設定</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="maintenance-mode"
                checked={maintenanceMode}
                onCheckedChange={toggleMaintenanceMode}
              />
              <Label htmlFor="maintenance-mode">メンテナンスモードを有効にする</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maintenance-message">メンテナンスメッセージ</Label>
              <Textarea
                id="maintenance-message"
                placeholder="メンテナンス中のメッセージを入力してください"
                value={maintenanceMessage}
                onChange={(e) => setMaintenanceMessage(e.target.value)}
              />
            </div>
            <Button onClick={saveMaintenanceSettings}>設定を保存</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>メンテナンススケジュール</CardTitle>
        </CardHeader>
        <CardContent>
          <p>ここにメンテナンススケジュールの管理機能を実装できます。</p>
          {/* メンテナンススケジュールの追加、編集、削除機能をここに実装 */}
        </CardContent>
      </Card>
    </div>
  )
}

