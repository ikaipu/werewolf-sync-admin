import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart, Users, PlayCircle, AlertTriangle } from 'lucide-react'

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">管理ダッシュボード</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">アクティブゲーム</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">現在進行中のゲーム数</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総プレイヤー数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">過去24時間で+56</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均ゲーム時間</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32分</div>
            <p className="text-xs text-muted-foreground">先週比 -2分</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">報告された問題</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">未解決の問題数</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>最近のゲーム</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <li key={i} className="flex items-center justify-between">
                  <span>ゲームID: {1000 + i}</span>
                  <span className="text-sm text-muted-foreground">{10 - i} 分前</span>
                </li>
              ))}
            </ul>
            <Button className="w-full mt-4">すべてのゲームを表示</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>人気の役職</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center justify-between">
                <span>人狼</span>
                <span className="text-sm text-muted-foreground">32%</span>
              </li>
              <li className="flex items-center justify-between">
                <span>占い師</span>
                <span className="text-sm text-muted-foreground">28%</span>
              </li>
              <li className="flex items-center justify-between">
                <span>村人</span>
                <span className="text-sm text-muted-foreground">20%</span>
              </li>
              <li className="flex items-center justify-between">
                <span>霊媒師</span>
                <span className="text-sm text-muted-foreground">12%</span>
              </li>
              <li className="flex items-center justify-between">
                <span>狂人</span>
                <span className="text-sm text-muted-foreground">8%</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

