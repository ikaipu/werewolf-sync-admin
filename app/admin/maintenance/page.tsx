'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useMaintenance } from '@/hooks/use-maintenance'
import { auth } from '@/lib/firebase'
import { useToast } from '@/components/ui/use-toast'

export default function MaintenanceManagement() {
  const { settings, loading, error, updateMaintenanceSettings } = useMaintenance()
  const { toast } = useToast()
  const [formEnabled, setFormEnabled] = useState(false)
  const [formMessage, setFormMessage] = useState('')
  const [formMessageEn, setFormMessageEn] = useState('')
  const [formBypassToken, setFormBypassToken] = useState('')

  // 初期値の設定
  useEffect(() => {
    if (settings) {
      setFormEnabled(settings.enabled)
      setFormMessage(settings.message)
      setFormMessageEn(settings.messageEn || '')
      setFormBypassToken(settings.bypassToken)
    }
  }, [settings])

  const handleSaveSettings = async () => {
    try {
      const user = auth.currentUser
      if (!user) {
        toast({
          title: "エラー",
          description: "管理者としてログインしていません。",
          variant: "destructive"
        })
        return
      }

      await updateMaintenanceSettings(
        formEnabled,
        formMessage,
        formMessageEn,
        formBypassToken,
        user.uid
      )
      toast({
        title: "成功",
        description: "メンテナンス設定を更新しました。",
      })
    } catch (error) {
      console.error('Error saving maintenance settings:', error)
      toast({
        title: "エラー",
        description: "設定の更新に失敗しました。",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!settings) {
    return <div>No settings found</div>
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
                checked={formEnabled}
                onCheckedChange={setFormEnabled}
              />
              <Label htmlFor="maintenance-mode">メンテナンスモードを有効にする</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maintenance-message">メンテナンスメッセージ（日本語）</Label>
              <Textarea
                id="maintenance-message"
                placeholder="メンテナンス中のメッセージを入力してください"
                value={formMessage}
                onChange={(e) => setFormMessage(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maintenance-message-en">メンテナンスメッセージ（英語・任意）</Label>
              <Textarea
                id="maintenance-message-en"
                placeholder="Enter maintenance message in English (optional)"
                value={formMessageEn}
                onChange={(e) => setFormMessageEn(e.target.value)}
              />
              <p className="text-sm text-gray-500">
                英語メッセージが未入力の場合、日本語メッセージが英語圏のユーザーにも表示されます。
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bypass-token">バイパストークン</Label>
              <Input
                id="bypass-token"
                type="text"
                placeholder="メンテナンスモードをバイパスするためのトークンを入力"
                value={formBypassToken}
                onChange={(e) => setFormBypassToken(e.target.value)}
              />
              <p className="text-sm text-gray-500">
                このトークンをURLパラメータとして使用することで、メンテナンスモード中でもアクセスが可能になります。
                例: ?bypass=token123
              </p>
            </div>
            <Button onClick={handleSaveSettings}>設定を保存</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
