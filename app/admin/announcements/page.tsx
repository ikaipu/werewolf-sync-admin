'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'

export default function AnnouncementsManagement() {
  const [announcements, setAnnouncements] = useState([
    { id: 1, title: '新機能追加のお知らせ', content: '新しい役職が追加されました！', active: true },
    { id: 2, title: 'メンテナンスのお知らせ', content: '明日の午前2時からメンテナンスを行います。', active: false },
  ])

  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' })

  const handleAddAnnouncement = () => {
    if (newAnnouncement.title && newAnnouncement.content) {
      setAnnouncements([...announcements, { ...newAnnouncement, id: Date.now(), active: true }])
      setNewAnnouncement({ title: '', content: '' })
    }
  }

  const toggleAnnouncementStatus = (id: number) => {
    setAnnouncements(announcements.map(ann => 
      ann.id === id ? { ...ann, active: !ann.active } : ann
    ))
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">お知らせ管理</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>新規お知らせ作成</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="タイトル"
              value={newAnnouncement.title}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
            />
            <Textarea
              placeholder="内容"
              value={newAnnouncement.content}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
            />
            <Button onClick={handleAddAnnouncement}>お知らせを追加</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>お知らせ一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>タイトル</TableHead>
                <TableHead>内容</TableHead>
                <TableHead>状態</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {announcements.map((announcement) => (
                <TableRow key={announcement.id}>
                  <TableCell>{announcement.title}</TableCell>
                  <TableCell>{announcement.content}</TableCell>
                  <TableCell>
                    <Switch
                      checked={announcement.active}
                      onCheckedChange={() => toggleAnnouncementStatus(announcement.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">編集</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

