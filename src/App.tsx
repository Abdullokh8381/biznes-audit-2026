import { useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, ResponsiveContainer, Tooltip } from "recharts"
import { Activity, BarChart3, ChevronRight, TrendingUp, ArrowLeft, Database, Users, Zap, FlaskConical } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Label } from "@/components/ui/label"

type Option = { l: string; v: string; p?: number };

const QUESTIONS = [
  { id: 'isOwner', text: 'Siz biznes egasimisiz?', type: 'select', options: [{ l: 'Ha, egasiman', v: 'yes' }, { l: 'Yangi boshlayapman', v: 'no' }], s: 'Subyekt' },
  { id: 'hasCRM', text: "Sizda CRM tizimi (Bitrix24/AmoCRM) bormi?", type: 'select', options: [{ l: 'Ha, hammasi joyida', v: 'yes' }, { l: "Yo'q, Excel yoki Qog'ozda", v: 'no', p: 0.2 }], s: 'Infratuzilma' },
  { id: 'hasSales', text: "Alohida sotuv bo'limi (menejerlar) bormi?", type: 'select', options: [{ l: 'Ha, komanda bor', v: 'yes' }, { l: "Yo'q, o'zim sotaman", v: 'no', p: 0.15 }], s: 'Sotuv' },
  { id: 'socialState', text: 'Ijtimoiy tarmoqlarning holati?', type: 'select', options: [{ l: 'Profil juda professional', v: 'top' }, { l: "O'rtacha holatda", v: 'mid' }, { l: "Holati yomon (yoki yo'q)", v: 'low', p: 0.1 }], s: 'Marketing' },
  {
    id: 'industry', text: 'Biznesingiz qaysi sohada?', type: 'select', options: [
      { l: 'Savdo (E-com)', v: 'retail' },
      { l: "Xizmat ko'rsatish", v: 'service' },
      { l: "O'quv markazi / EdTech", v: 'edu' },
      { l: 'Ishlab chiqarish', v: 'factory' },
      { l: 'Konsalting / Agentlik', v: 'consult' },
      { l: 'IT / Dasturlash', v: 'it' },
      { l: 'Tibbiyot / Klinika', v: 'med' },
      { l: 'HORECA (Restoran/Kafe)', v: 'food' },
      { l: 'Logistika', v: 'logistics' },
      { l: "Qurilish / Ko'chmas mulk", v: 'const' },
      { l: 'Boshqa', v: 'other' }
    ], s: 'Soha'
  },
  { id: 'platform', text: 'Asosiy reklama platformangiz qaysi?', type: 'select', multi: true, options: [{ l: 'Instagram', v: 'insta' }, { l: 'Facebook', v: 'fb' }, { l: 'Google Ads', v: 'google' }, { l: 'Telegram', v: 'tg' }], s: 'Marketing' },
  { id: 'currentRev', text: 'Hozirgi oylik aylanma? ($)', type: 'number', placeholder: '2000', s: 'Moliya' },
  { id: 'targetRev', text: 'Oylik DAROMAD maqsadingiz? ($)', type: 'number', placeholder: '10000', s: 'Moliya' },
  { id: 'avgCheck', text: "O'rtacha chek miqdori? ($)", type: 'number', placeholder: '50', s: 'Moliya' },
  { id: 'conversion', text: 'Sotuv konversiyasi necha foiz? (%)', type: 'number', placeholder: '25', s: 'Moliya' },
  { id: 'ltv', text: "Mijoz 1 yilda o'rtacha necha marta sotib oladi?", type: 'number', placeholder: '1', s: 'Metrika' },
  { id: 'currentCPL', text: 'Hozirda 1 ta lid (so\'rov) sizga necha pulga tushmoqda? ($)', type: 'number', placeholder: '1.5', s: 'Marketing' },
  { id: 'speedToLead', text: 'Mijozga birinchi javob berish tezligi?', type: 'select', options: [{ l: '< 5 daqiqa (Tezkor)', v: 'fast' }, { l: '1 soat ichida', v: 'med', p: 0.1 }, { l: '1 kun ichida', v: 'slow', p: 0.3 }], s: 'Sotuv' }
]

const BENCHMARKS: Record<string, number[]> = {
  retail: [0.8, 1.2, 3.0, 0.6],
  service: [1.2, 1.8, 4.0, 1.0],
  edu: [1.0, 1.5, 3.5, 0.8],
  factory: [5.0, 8.0, 15.0, 4.0],
  consult: [3.0, 5.0, 10.0, 2.5],
  it: [4.0, 6.0, 12.0, 3.0],
  med: [2.0, 3.5, 8.0, 1.5],
  food: [0.5, 0.9, 2.5, 0.4],
  logistics: [2.5, 4.0, 9.0, 2.0],
  const: [6.0, 10.0, 20.0, 5.0],
  other: [1.0, 1.5, 4.0, 1.0]
}

const PLATFORM_DATA: Record<string, { name: string, min: number, max: number }> = {
  insta: { name: 'Instagram', min: 0.8, max: 1.2 },
  fb: { name: 'Facebook', min: 1.0, max: 1.8 },
  google: { name: 'Google', min: 2.5, max: 6.0 },
  tg: { name: 'Telegram', min: 0.5, max: 1.0 }
}

export default function App() {
  const [step, setStep] = useState(-1) // -1 is start screen
  const [auditData, setAuditData] = useState<any>({ platform: [] })
  const [otherIndustry, setOtherIndustry] = useState("")
  const [numInput, setNumInput] = useState("")

  const startAudit = () => {
    if (!auditData.userName) {
      alert("Iltimos, ismingizni kiriting!")
      return
    }
    setStep(0)
  }

  const goBack = () => {
    if (step > 0) setStep(step - 1)
    else setStep(-1)
  }

  const handleSelect = (id: string, val: string, isMulti?: boolean) => {
    if (isMulti) {
      const arr = auditData[id] || []
      if (arr.includes(val)) {
        setAuditData({ ...auditData, [id]: arr.filter((v: string) => v !== val) })
      } else {
        setAuditData({ ...auditData, [id]: [...arr, val] })
      }
    } else {
      setAuditData({ ...auditData, [id]: val })
      if (val !== 'other') goNext()
    }
  }

  const handleOtherIndustry = () => {
    if (!otherIndustry) return
    setAuditData({ ...auditData, industry: 'other', otherIndustry })
    goNext()
  }

  const goNext = () => {
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1)
      setNumInput("")
    } else {
      setStep(QUESTIONS.length) // dashboard
    }
  }

  const handleNumNext = () => {
    if (!numInput) return
    setAuditData({ ...auditData, [QUESTIONS[step].id]: parseFloat(numInput) })
    goNext()
  }

  // Header Component
  const Header = () => (
    <header className="w-full max-w-6xl flex justify-between items-center mb-8 mx-auto sticky top-0 bg-background/80 backdrop-blur z-50 py-4 px-4 sm:px-6 print:hidden">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <Activity className="text-primary w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">ProAudit <span className="font-light text-muted-foreground">Tizimli Analiz</span></h1>
      </div>
    </header>
  )

  if (step === -1) {
    return (
      <div className="min-h-screen bg-background text-foreground pb-12">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500 max-w-3xl mx-auto pt-10">
          <div className="w-24 h-24 bg-primary/10 rounded-3xl mb-8 flex items-center justify-center">
            <BarChart3 className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
            Biznesingizni <span className="text-primary block mt-2">Professionallar kabi audit qiling</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-12 max-w-lg mx-auto">
            Ushbu tizim sizning marketing, sotuv va moliya ko'rsatkichlaringizni tahlil qilib, 2026-yil uchun kuchli o'sish rejasini taqdim etadi.
          </p>
          <Card className="w-full max-w-md shadow-lg border-muted/50">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userName" className="text-left block text-muted-foreground">Sizning ismingiz</Label>
                <Input 
                  id="userName" 
                  value={auditData.userName || ""} 
                  onChange={(e) => setAuditData({...auditData, userName: e.target.value})}
                  onKeyDown={(e) => e.key === 'Enter' && startAudit()}
                  placeholder="Masalan: Abdulloh" 
                  className="text-lg py-6"
                />
              </div>
              <Button onClick={startAudit} className="w-full text-lg py-6" size="lg">
                Auditni boshlash
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (step < QUESTIONS.length) {
    const q = QUESTIONS[step]
    const progress = ((step + 1) / QUESTIONS.length) * 100

    return (
      <div className="min-h-screen bg-muted/20 pb-12">
        <Header />
        <div className="max-w-2xl mx-auto p-4 sm:p-6 animate-in slide-in-from-bottom-8 duration-500 relative">
          <div className="mb-8">
            <Progress value={progress} className="h-2 mb-2" />
            <div className="flex justify-between items-center text-sm font-medium text-muted-foreground uppercase tracking-wider">
              <span>{q.s}</span>
              <span>{step + 1} / {QUESTIONS.length}</span>
            </div>
          </div>

          <Card className="shadow-lg border-muted/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/50"></div>
            <CardHeader className="pt-8 pb-4">
              <Button variant="ghost" size="icon" onClick={goBack} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <CardTitle className="text-2xl sm:text-3xl leading-tight font-bold pr-12">{q.text}</CardTitle>
            </CardHeader>
            <CardContent className="pb-8">
              {q.type === 'select' ? (
                <div className="grid grid-cols-1 gap-3 mt-4">
                  {q.options?.map(opt => {
                    const isSelected = q.multi ? auditData[q.id]?.includes(opt.v) : auditData[q.id] === opt.v
                    const showInput = opt.v === 'other' && isSelected

                    return (
                      <div key={opt.v} className="flex flex-col gap-2">
                        <Button
                          variant={isSelected && !showInput ? "default" : "outline"}
                          className={`justify-between h-auto py-4 px-6 text-base font-normal ${isSelected ? 'border-primary' : 'hover:border-primary/50'} transition-all`}
                          onClick={() => handleSelect(q.id, opt.v, q.multi)}
                        >
                          {opt.l}
                          <ChevronRight className={`w-5 h-5 ${isSelected ? 'opacity-100' : 'opacity-0'} transition-opacity`} />
                        </Button>
                        {showInput && (
                          <div className="flex gap-2 items-center px-1 animate-in zoom-in-95 mt-2">
                            <Input 
                              autoFocus
                              placeholder="Sohangizni yozing..." 
                              value={otherIndustry} 
                              onChange={(e) => setOtherIndustry(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleOtherIndustry()}
                            />
                            <Button onClick={handleOtherIndustry}>Tasdiqlash</Button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                  
                  {q.multi && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <Button onClick={goNext} className="w-full text-lg py-6" disabled={!auditData[q.id]?.length}>
                        Keyingi qadam
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6 mt-4">
                  <Input 
                    type="number"
                    value={numInput}
                    onChange={(e) => setNumInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleNumNext()}
                    className="text-3xl font-bold py-8 text-center"
                    placeholder={q.placeholder}
                    autoFocus
                  />
                  <p className="text-center text-muted-foreground text-sm">Faqat son kiritng</p>
                  <Button onClick={handleNumNext} className="w-full py-6 text-lg" disabled={!numInput}>Keyingi qadam</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Dashboard calculations
  const tRev = auditData.targetRev || 0
  const cRev = auditData.currentRev || 0
  const avgCheck = auditData.avgCheck || 1
  const conv = (auditData.conversion / 100) || 0.1

  let platform: { min: number, max: number, name: string }
  if (Array.isArray(auditData.platform) && auditData.platform.length > 0) {
    let minSum = 0, maxSum = 0, names: string[] = []
    auditData.platform.forEach((p: string) => {
      const b = PLATFORM_DATA[p] || PLATFORM_DATA.insta
      minSum += b.min
      maxSum += b.max
      names.push(b.name)
    })
    platform = {
      min: minSum / auditData.platform.length,
      max: maxSum / auditData.platform.length,
      name: names.join(', ')
    }
  } else {
    platform = PLATFORM_DATA[auditData.platform || 'insta'] || PLATFORM_DATA.insta
  }

  let penalty = 0
  QUESTIONS.forEach(q => {
    if (q.options) {
      if (Array.isArray(auditData[q.id])) return; // skip penalties for multi for simplicity
      const selected = (q.options as Option[]).find(o => o.v === auditData[q.id])
      if (selected && selected.p) penalty += selected.p
    }
  })

  const cust = Math.ceil(tRev / avgCheck)
  const leads = Math.ceil(cust / conv)
  const gap = tRev - cRev
  const bOpt = Math.round(leads * platform.max)
  const bReal = Math.round(bOpt * (1 + penalty))
  
  const roas = bReal ? (tRev / bReal).toFixed(1) : 0
  const lostYearly = Math.round((tRev * penalty) * 12)
  const score = Math.max(0, Math.round(90 - (penalty * 100)))

  let riskStatus = 'Yaxshi'
  let riskColor = 'text-green-500' // Using tailwind colors directly for these specific indicators
  if (penalty >= 0.4) {
    riskStatus = 'Kritik'
    riskColor = 'text-red-500'
  } else if (penalty > 0) {
    riskStatus = "O'rtacha"
    riskColor = 'text-orange-500'
  }

  // Charts Config
  const revenueData = [
    { name: "Hozirgi", daromad: cRev },
    { name: "Maqsad", daromad: tRev }
  ]

  const userCPL = auditData.currentCPL || 1.2
  const industryKey = auditData.industry === 'other' ? 'other' : (auditData.industry || 'other')
  const baseBenchmarks = BENCHMARKS[industryKey] || BENCHMARKS['other']
  
  const benchmarkData = [
    { pf: 'Insta', sizning_narxingiz: userCPL, soha_narxi: baseBenchmarks[0] },
    { pf: 'FB', sizning_narxingiz: userCPL, soha_narxi: baseBenchmarks[1] },
    { pf: 'Google', sizning_narxingiz: userCPL, soha_narxi: baseBenchmarks[2] },
    { pf: 'TG', sizning_narxingiz: userCPL, soha_narxi: baseBenchmarks[3] },
  ]

  const roadmapItems = []
  if (auditData.hasCRM === 'no') roadmapItems.push({ t: "CRM o'rnatish", d: "Bitrix24/AmoCRM o'rnating, lidlar yo'qolishini (20%) to'xtating.", i: Database })
  if (auditData.hasSales === 'no') roadmapItems.push({ t: 'Sotuvchi yollash', d: 'Sotuv konversiyasini oshiring va o\'z vaqtingizni tejang.', i: Users })
  if (auditData.speedToLead !== 'fast') roadmapItems.push({ t: 'Speed-to-Lead', d: 'Mijozga 5 daqiqada javob berishni yo\'lga qo\'ying (Sotuv 7x oshadi).', i: Zap })
  roadmapItems.push({ t: 'A/B Test', d: 'Asosiy kreativlarni $100-$200 byudjet bilan sinab, konversiyani o\'lchang.', i: FlaskConical })

  return (
    <div className="min-h-screen bg-muted/20 pb-16">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 animate-in fade-in duration-700">
        <div className="mb-8 print:hidden flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">Salom, {auditData.userName}!</h2>
            <p className="text-muted-foreground text-lg">Sizning to'liq biznes tahlilingiz tayyor.</p>
          </div>
          <Button variant="outline" onClick={() => window.print()}>
            PDF orqali yuklash
          </Button>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="md:col-span-2 relative overflow-hidden bg-card border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground tracking-widest uppercase">Umumiy Holat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4">
                <div className="text-6xl font-black">{score}%</div>
                <div className="pb-2">
                  <p className={`text-xl font-bold ${riskColor}`}>{riskStatus}</p>
                  <p className="text-sm text-muted-foreground">Tizim samaradorligi</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground tracking-widest uppercase">Moliyaviy Gap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-primary">${gap.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-2">Maqsadgacha masofa</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground tracking-widest uppercase">ROAS Prognoz</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-purple-500">x{roas}</div>
              <p className="text-xs text-muted-foreground mt-2">Kutilayotgan qaytim</p>
            </CardContent>
          </Card>
        </div>

        {/* Funnel & Budget */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Funnel va Konversiya Tahlili
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground text-sm">Sotuv konversiyasi:</span>
                    <span className="font-bold">{auditData.conversion}%</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground text-sm">Lidlar oqimi (Oyiga):</span>
                    <span className="font-bold">{leads.toLocaleString()} ta</span>
                  </div>
                </div>
                <div className="flex flex-col justify-center items-center p-4 bg-muted/30 rounded-xl border border-border">
                  <span className="text-muted-foreground text-sm mb-1">CPL (Lid narxi):</span>
                  <p className="text-3xl font-black text-purple-500">${platform.max.toFixed(2)}</p>
                </div>
              </div>
              <div className="bg-primary/5 border border-primary/20 p-6 rounded-xl flex justify-between items-center">
                 <div>
                    <span className="text-primary text-sm font-semibold uppercase tracking-wider block mb-1">Kerakli yangi mijozlar</span>
                    <p className="text-3xl font-black">{cust.toLocaleString()} ta</p>
                 </div>
                 <Users className="w-10 h-10 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-xs font-bold text-primary-foreground/70 tracking-widest uppercase">Optimal Reklama Byudjeti</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-6xl font-black">${bOpt.toLocaleString()}</div>
              <p className="text-sm mt-4 text-primary-foreground/80 leading-relaxed">
                Ushbu byudjet sizning moliyaviy maqsadingizga erishish uchun tavsiya etilgan investitsiya.
              </p>
            </CardContent>
            <CardFooter>
               <div className="w-full relative">
                 <div className="absolute inset-0 bg-background/20 rounded-xl blur-sm pointer-events-none"></div>
                 <div className="relative p-4 rounded-xl flex items-center justify-between border border-background/20 backdrop-blur-sm">
                   <div className="flex items-center gap-2">
                     <TrendingUp className="w-5 h-5" />
                     <span className="font-bold uppercase tracking-wider text-sm">Platforma</span>
                   </div>
                   <span className="font-mono text-sm tracking-tighter opacity-90">{platform.name}</span>
                 </div>
               </div>
            </CardFooter>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 print:block print:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Daromad Gap Tahlili</CardTitle>
              <CardDescription>Hozirgi va maqsadli oyni solishtirish</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ChartContainer config={{ daromad: { label: "Daromad ($)", color: "hsl(var(--primary))" } }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="daromad" fill="var(--color-daromad)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Soha Benchmarklari (Lid Narxi)</CardTitle>
              <CardDescription>Platformalar bo'yicha narx o'zgarishi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={benchmarkData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="pf" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} width={30} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }} 
                      labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                    />
                    <Line type="monotone" dataKey="sizning_narxingiz" name="Sizning Narxingiz ($)" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="soha_narxi" name="Soha Narxi ($)" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Roadmap and Loss */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl">Strategik Yo'l Xaritasi (2026)</CardTitle>
              <CardDescription>O'sish va muammolarni bartaraf etish rejalari</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 mt-2">
                {roadmapItems.map((item, i) => (
                  <div key={i} className="flex gap-4 items-start group">
                    <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center shrink-0 border border-border group-hover:border-primary group-hover:bg-primary/5 transition-all">
                      <item.i className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <h5 className="text-base font-bold mb-1 leading-none">{item.t}</h5>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-500/20 bg-red-500/5 text-center flex flex-col justify-center">
            <CardHeader>
              <CardTitle className="text-xs font-bold text-red-500 uppercase tracking-[3px] mb-2">Loss Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-black text-red-500 mb-4">${lostYearly.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground px-4 mb-8">
                Tizimning noto'g'ri ishlashi va CRM dagi bo'shliqlar tufayli yo'qotilayotgan yillik daromad.
              </p>
              <div className="pt-6 border-t border-red-500/10">
                <p className="text-[10px] font-bold text-red-500/60 uppercase tracking-widest mb-1">Samaradorlik Jarimasi</p>
                <div className="text-2xl font-black text-red-500/80">+{Math.round(penalty * 100)}%</div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
