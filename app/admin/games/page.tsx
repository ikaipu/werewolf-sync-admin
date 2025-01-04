import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

const games = [
  { id: 1001, players: 8, status: '進行中', time: '22分', winner: '-' },
  { id: 1002, players: 10, status: '終了', time: '35分', winner: '人狼' },
  { id: 1003, players: 12, status: '終了', time: '40分', winner: '村人' },
  { id: 1004, players: 7, status: '待機中', time: '-', winner: '-' },
  { id: 1005, players: 9, status: '進行中', time: '15分', winner: '-' },
]

export default function GamesManagement() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">ゲーム管理</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>アクティブゲーム</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ゲームID</TableHead>
                <TableHead>プレイヤー数</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>経過時間</TableHead>
                <TableHead>勝者</TableHead>
                <TableHead>アクション</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {games.map((game) => (
                <TableRow key={game.id}>
                  <TableCell>{game.id}</TableCell>
                  <TableCell>{game.players}</TableCell>
                  <TableCell>
                    <Badge variant={game.status === '進行中' ? 'default' : game.status === '終了' ? 'secondary' : 'outline'}>
                      {game.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{game.time}</TableCell>
                  <TableCell>{game.winner}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">詳細</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ゲーム設定</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">最大プレイヤー数</label>
              <input type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" defaultValue={15} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">ゲーム時間制限（分）</label>
              <input type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" defaultValue={60} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">役職の割合</label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span>人狼</span>
                  <input type="range" min="0" max="100" defaultValue="30" className="w-1/2" />
                </div>
                <div className="flex items-center justify-between">
                  <span>村人</span>
                  <input type="range" min="0" max="100" defaultValue="40" className="w-1/2" />
                </div>
                <div className="flex items-center justify-between">
                  <span>占い師</span>
                  <input type="range" min="0" max="100" defaultValue="15" className="w-1/2" />
                </div>
                <div className="flex items-center justify-between">
                  <span>霊媒師</span>
                  <input type="range" min="0" max="100" defaultValue="10" className="w-1/2" />
                </div>
                <div className="flex items-center justify-between">
                  <span>狂人</span>
                  <input type="range" min="0" max="100" defaultValue="5" className="w-1/2" />
                </div>
              </div>
            </div>
          </div>
          <Button className="mt-6">設定を保存</Button>
        </CardContent>
      </Card>
    </div>
  )
}

