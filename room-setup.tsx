'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, HelpCircle, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'
import { AdPlaceholder } from './components/ad-placeholder'

interface Player {
  id: string
  name: string
  avatar: string
}

interface Role {
  id: string
  name: string
  icon: string
  count: number
}

const avatars = ['🐺', '🦊', '🐻', '🐶', '🦁', '🐯', '🐱', '🐭', '🐹', '🐰', '🦝', '🐻‍❄️']

export default function RoomSetup() {
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: 'たくみ', avatar: '🐺' },
    { id: '2', name: 'もえやん', avatar: '🦊' },
    { id: '3', name: 'ゆうき', avatar: '🐻' },
    { id: '4', name: 'かんなぽけもん', avatar: '🐶' },
  ])
  const [newPlayerName, setNewPlayerName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const [roles, setRoles] = useState<Role[]>([
    { id: 'werewolf', name: '人狼', icon: '🦊', count: 1 },
    { id: 'seer', name: '占い師', icon: '🔮', count: 1 },
    { id: 'medium', name: '霊媒師', icon: '👻', count: 0 },
    { id: 'knight', name: '騎士', icon: '🛡️', count: 0 },
    { id: 'madman', name: '狂人', icon: '🎭', count: 0 },
  ])

  const addPlayer = () => {
    if (newPlayerName.trim() === '') {
      toast({
        title: 'エラー',
        description: 'プレイヤー名を入力してください。',
        variant: 'destructive',
      })
      return
    }
    if (players.length >= 15) {
      toast({
        title: 'エラー',
        description: 'プレイヤーの最大数に達しました。',
        variant: 'destructive',
      })
      return
    }
    const newPlayer: Player = {
      id: Date.now().toString(),
      name: newPlayerName,
      avatar: avatars[Math.floor(Math.random() * avatars.length)],
    }
    setPlayers([...players, newPlayer])
    setNewPlayerName('')
    inputRef.current?.focus()
    toast({
      title: 'プレイヤーを追加しました',
      description: `${newPlayerName} さんが参加しました！`,
    })
  }

  const removePlayer = (playerId: string) => {
    setPlayers(players.filter(player => player.id !== playerId))
    toast({
      title: 'プレイヤーを削除しました',
      description: 'プレイヤーリストから削除されました。',
    })
  }

  const updateRoleCount = (roleId: string, increment: boolean) => {
    setRoles(roles.map(role => 
      role.id === roleId 
        ? { ...role, count: increment ? role.count + 1 : Math.max(0, role.count - 1) }
        : role
    ))
  }

  return (
    <div className="min-h-screen bg-[#ffd800] p-6">
      <AdPlaceholder type="banner" className="mb-6" />
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8">🐺</div>
          <h1 className="text-2xl font-bold">ルーム設定</h1>
        </div>

        <div className="space-y-2">
          <label htmlFor="playerName" className="font-bold">プレイヤー名：</label>
          <div className="flex gap-2">
            <Input 
              id="playerName"
              placeholder="プレイヤー名を入力" 
              className="bg-white rounded-md"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
              ref={inputRef}
            />
            <Button 
              onClick={addPlayer}
              className="bg-[#ff8811] hover:bg-[#ff8811]/90 text-white w-12 h-12 rounded-md"
            >
              <Plus className="w-6 h-6" />
            </Button>
          </div>
        </div>

        <motion.div 
          className="grid grid-cols-2 gap-4"
          initial={false}
        >
          <AnimatePresence>
            {players.map(player => (
              <motion.div
                key={player.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-4 rounded-md relative"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removePlayer(player.id)}
                  className="absolute top-1 right-1 text-red-500 hover:bg-red-100 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
                <div className="text-center">
                  <div className="text-4xl mb-2">{player.avatar}</div>
                  <div className="text-sm font-medium truncate">{player.name}</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <AdPlaceholder type="square" className="my-6" />

        <div className="space-y-2">
          <h2 className="font-bold">役職：</h2>
          <div className="space-y-3">
            {roles.map(role => (
              <div key={role.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{role.icon}</span>
                  <span>{role.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={() => updateRoleCount(role.id, false)}
                    className="bg-[#048a81] hover:bg-[#048a81]/90 text-white w-10 h-10"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-6 text-center">{role.count}</span>
                  <Button 
                    onClick={() => updateRoleCount(role.id, true)}
                    className="bg-[#ff8811] hover:bg-[#ff8811]/90 text-white w-10 h-10"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>👤</span>
                <span>村人</span>
              </div>
              <span className="w-6 text-center">2</span>
            </div>
          </div>
        </div>

        <button className="flex items-center justify-between w-full py-2">
          <span className="font-bold">詳細設定</span>
          <div className="flex items-center gap-2">
            <ChevronRight className="w-5 h-5" />
            <HelpCircle className="w-5 h-5" />
          </div>
        </button>

        <div className="space-y-3">
          <Input placeholder="ルームID" className="bg-white rounded-md" />
          <Input placeholder="ルームパスワード" className="bg-white rounded-md" />
        </div>

        <AdPlaceholder type="banner" className="my-6" />

        <div className="flex gap-4">
          <Button 
            className="flex-1 bg-[#048a81] hover:bg-[#048a81]/90 text-white"
          >
            もどる
          </Button>
          <Button 
            className="flex-1 bg-[#ff8811] hover:bg-[#ff8811]/90 text-white"
          >
            ルーム作成
          </Button>
        </div>
      </div>
      <div className="fixed bottom-4 right-4">
        <AdPlaceholder type="floating" className="w-[120px] shadow-lg" />
      </div>
    </div>
  )
}

