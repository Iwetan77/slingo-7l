"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Upload, Wallet, Sun, Moon, Copy, Check, X, Plus, Minus, ExternalLink, Calendar } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { generateShortId } from "@/utils/generate-short-id"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"

export default function PaymentPage() {
  // Common state
  const [linkType, setLinkType] = useState<"payment" | "crowdfund" | "poll" | "betting">("payment")
  const [theme, setTheme] = useState<"light" | "dark">("dark")
  const [activeTab, setActiveTab] = useState("generate")
  const [paymentLink, setPaymentLink] = useState("")
  const [copied, setCopied] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Payment state
  const [paymentData, setPaymentData] = useState({
    description: "",
    amount: "",
    currency: "SUI",
    slug: "",
  })

  // Crowdfunding state
  const [crowdfundData, setCrowdfundData] = useState({
    title: "",
    description: "",
    goal: "",
    currency: "SUI",
    deadline: "",
    slug: "",
  })

  // Poll state
  const [pollData, setPollData] = useState({
    question: "",
    description: "",
    options: ["", ""],
    deadline: "",
    allowMultiple: false,
    slug: "",
  })

  // Betting state
  const [bettingData, setBettingData] = useState({
    title: "",
    description: "",
    source: "bet365",
    eventId: "",
    odds: "",
    stake: "",
    currency: "SUI",
    slug: "",
  })

  // Betting sources
  const bettingSources = [
    { id: "bet365", name: "Bet365" },
    { id: "stake", name: "Stake" },
    { id: "draftkings", name: "DraftKings" },
  ]

  // Sample betting events
  const bettingEvents = {
    bet365: [
      { id: "b365-1", name: "Manchester United vs Liverpool", odds: 2.5 },
      { id: "b365-2", name: "Lakers vs Warriors", odds: 1.95 },
      { id: "b365-3", name: "Wimbledon Final", odds: 1.75 },
    ],
    stake: [
      { id: "stake-1", name: "Bitcoin price above $100k by EOY", odds: 3.2 },
      { id: "stake-2", name: "Ethereum merge success", odds: 1.5 },
      { id: "stake-3", name: "Solana vs Cardano market cap", odds: 2.1 },
    ],
    draftkings: [
      { id: "dk-1", name: "Super Bowl LVIII", odds: 1.9 },
      { id: "dk-2", name: "World Series", odds: 2.2 },
      { id: "dk-3", name: "Stanley Cup", odds: 2.4 },
    ],
  }

  useEffect(() => {
    const savedTheme =
      localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    setTheme(savedTheme)
    document.documentElement.classList.toggle("dark", savedTheme === "dark")
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  const generateLink = () => {
    const shortId = generateShortId()
    const baseLink = `slingo.pay/${shortId}`

    let link = baseLink
    switch (linkType) {
      case "payment":
        link = `${baseLink}?type=payment`
        break
      case "crowdfund":
        link = `${baseLink}?type=crowdfund`
        break
      case "poll":
        link = `${baseLink}?type=poll`
        break
      case "betting":
        link = `${baseLink}?type=betting`
        break
    }

    setPaymentLink(link)
    setShowPreview(true)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(paymentLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file")
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB")
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const addPollOption = () => {
    setPollData({
      ...pollData,
      options: [...pollData.options, ""],
    })
  }

  const removePollOption = (index: number) => {
    if (pollData.options.length <= 2) return
    const newOptions = [...pollData.options]
    newOptions.splice(index, 1)
    setPollData({
      ...pollData,
      options: newOptions,
    })
  }

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollData.options]
    newOptions[index] = value
    setPollData({
      ...pollData,
      options: newOptions,
    })
  }

  const handleBettingSourceChange = (source: string) => {
    setBettingData({
      ...bettingData,
      source,
      eventId: "",
    })
  }

  const handleBettingEventChange = (eventId: string) => {
    const source = bettingData.source
    const event = bettingEvents[source as keyof typeof bettingEvents].find((e) => e.id === eventId)

    setBettingData({
      ...bettingData,
      eventId,
      odds: event ? event.odds.toString() : "",
    })
  }

  const renderLinkPreview = () => {
    switch (linkType) {
      case "payment":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Payment Request</h3>
              <span className="text-sm text-muted-foreground">slingo.pay</span>
            </div>
            {imagePreview && (
              <div className="relative w-full h-40 rounded-lg overflow-hidden">
                <Image src={imagePreview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
              </div>
            )}
            <div>
              <h4 className="font-medium">{paymentData.description || "Untitled Payment"}</h4>
              <div className="flex items-center gap-2 mt-2">
                <Image
                  src={
                    paymentData.currency === "SUI"
                      ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sui-sui-logo-zrV4GkCMLSfBMYHKrFOhkfaOtzZxJ6.png"
                      : "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/usd-coin-usdc-logo-wJSmP5Z7I2JTba6Bnc7jJpNujOYlb5.png"
                  }
                  alt={paymentData.currency}
                  width={24}
                  height={24}
                />
                <span className="text-xl font-bold">
                  {paymentData.amount || "0.00"} {paymentData.currency}
                </span>
              </div>
            </div>
            <Button className="w-full bg-slingo hover:bg-slingo/90">Pay Now</Button>
          </div>
        )

      case "crowdfund":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Crowdfunding</h3>
              <span className="text-sm text-muted-foreground">slingo.pay</span>
            </div>
            {imagePreview && (
              <div className="relative w-full h-40 rounded-lg overflow-hidden">
                <Image src={imagePreview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
              </div>
            )}
            <div>
              <h4 className="font-medium">{crowdfundData.title || "Untitled Crowdfund"}</h4>
              <p className="text-sm text-muted-foreground mt-1">{crowdfundData.description || "No description"}</p>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span>
                    0 / {crowdfundData.goal || "0"} {crowdfundData.currency}
                  </span>
                </div>
                <Progress value={0} className="h-2" />
              </div>

              {crowdfundData.deadline && (
                <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Ends on {new Date(crowdfundData.deadline).toLocaleDateString()}</span>
                </div>
              )}
            </div>
            <Button className="w-full bg-slingo hover:bg-slingo/90">Contribute</Button>
          </div>
        )

      case "poll":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Poll</h3>
              <span className="text-sm text-muted-foreground">slingo.pay</span>
            </div>
            {imagePreview && (
              <div className="relative w-full h-40 rounded-lg overflow-hidden">
                <Image src={imagePreview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
              </div>
            )}
            <div>
              <h4 className="font-medium">{pollData.question || "Untitled Poll"}</h4>
              <p className="text-sm text-muted-foreground mt-1">{pollData.description || "No description"}</p>

              <div className="mt-4 space-y-2">
                <RadioGroup defaultValue="option-0">
                  {pollData.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 rounded-md border p-3">
                      <RadioGroupItem value={`option-${index}`} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`}>{option || `Option ${index + 1}`}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {pollData.deadline && (
                <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Voting ends on {new Date(pollData.deadline).toLocaleDateString()}</span>
                </div>
              )}
            </div>
            <Button className="w-full bg-slingo hover:bg-slingo/90">Vote</Button>
          </div>
        )

      case "betting":
        const selectedSource = bettingData.source
        const selectedEventId = bettingData.eventId
        const selectedEvent = selectedEventId
          ? bettingEvents[selectedSource as keyof typeof bettingEvents].find((e) => e.id === selectedEventId)
          : null

        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Betting</h3>
              <span className="text-sm text-muted-foreground">slingo.pay</span>
            </div>
            {imagePreview && (
              <div className="relative w-full h-40 rounded-lg overflow-hidden">
                <Image src={imagePreview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
              </div>
            )}
            <div>
              <h4 className="font-medium">{bettingData.title || "Untitled Bet"}</h4>
              <p className="text-sm text-muted-foreground mt-1">{bettingData.description || "No description"}</p>

              <div className="mt-4 p-3 border rounded-md">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{selectedEvent?.name || "Select an event"}</span>
                  <span className="text-sm bg-slingo/10 text-slingo px-2 py-1 rounded-full">
                    {bettingData.odds || "0.00"}x
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Your stake</span>
                  <span>
                    {bettingData.stake || "0.00"} {bettingData.currency}
                  </span>
                </div>

                <div className="mt-1 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Potential win</span>
                  <span className="font-medium">
                    {bettingData.stake && bettingData.odds
                      ? (Number.parseFloat(bettingData.stake) * Number.parseFloat(bettingData.odds)).toFixed(2)
                      : "0.00"}{" "}
                    {bettingData.currency}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <ExternalLink className="h-3 w-3" />
                  <span>
                    Source: {bettingSources.find((s) => s.id === bettingData.source)?.name || bettingData.source}
                  </span>
                </div>
              </div>
            </div>
            <Button className="w-full bg-slingo hover:bg-slingo/90">Place Bet</Button>
          </div>
        )
    }
  }

  return (
    <div className={`min-h-screen bg-background`}>
      {/* Header */}
      <header className="border-b border-border/5">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#8A3FFC] to-[#FF00FF] bg-clip-text text-transparent">
            Slingo
          </h1>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={toggleTheme} className="rounded-full">
              {theme === "dark" ? <Sun className="h-4 w-4 text-white" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button className="bg-slingo hover:bg-slingo/90">
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="bg-card/50 backdrop-blur">
            <CardContent className="p-6">
              <h2 className="text-sm font-medium text-muted-foreground mb-2">Total Earnings</h2>
              <div className="flex items-center gap-2">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sui-sui-logo-zrV4GkCMLSfBMYHKrFOhkfaOtzZxJ6.png"
                  alt="SUI"
                  width={24}
                  height={24}
                />
                <span className="text-2xl font-bold">0.00 SUI</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/usd-coin-usdc-logo-wJSmP5Z7I2JTba6Bnc7jJpNujOYlb5.png"
                  alt="USDC"
                  width={16}
                  height={16}
                  className="opacity-50"
                />
                <span className="text-sm text-muted-foreground">≈ $0.00 USDC</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur">
            <CardContent className="p-6">
              <h2 className="text-sm font-medium text-muted-foreground mb-2">Active Links</h2>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="generate" className="w-full" onValueChange={(value) => setActiveTab(value)}>
          <TabsList className="mb-4">
            <TabsTrigger value="generate">Generate Link</TabsTrigger>
            <TabsTrigger value="history">Link History</TabsTrigger>
          </TabsList>

          <TabsContent value="generate">
            <Card className="bg-card/50 backdrop-blur">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label>Link Type</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Button
                      variant={linkType === "payment" ? "default" : "outline"}
                      className={linkType === "payment" ? "bg-slingo hover:bg-slingo/90" : ""}
                      onClick={() => setLinkType("payment")}
                    >
                      Payment
                    </Button>
                    <Button
                      variant={linkType === "crowdfund" ? "default" : "outline"}
                      className={linkType === "crowdfund" ? "bg-slingo hover:bg-slingo/90" : ""}
                      onClick={() => setLinkType("crowdfund")}
                    >
                      Crowdfunding
                    </Button>
                    <Button
                      variant={linkType === "poll" ? "default" : "outline"}
                      className={linkType === "poll" ? "bg-slingo hover:bg-slingo/90" : ""}
                      onClick={() => setLinkType("poll")}
                    >
                      Poll
                    </Button>
                    <Button
                      variant={linkType === "betting" ? "default" : "outline"}
                      className={linkType === "betting" ? "bg-slingo hover:bg-slingo/90" : ""}
                      onClick={() => setLinkType("betting")}
                    >
                      Betting
                    </Button>
                  </div>
                </div>

                {/* Payment Form */}
                {linkType === "payment" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="payment-description">Description</Label>
                      <Input
                        id="payment-description"
                        placeholder="Describe what you're selling..."
                        className="bg-background/50"
                        value={paymentData.description}
                        onChange={(e) => setPaymentData({ ...paymentData, description: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Price</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="0.00"
                          className="bg-background/50"
                          value={paymentData.amount}
                          onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                        />
                        <Select
                          value={paymentData.currency}
                          onValueChange={(value) => setPaymentData({ ...paymentData, currency: value })}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue>
                              {paymentData.currency && (
                                <div className="flex items-center gap-2">
                                  <Image
                                    src={
                                      paymentData.currency === "SUI"
                                        ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sui-sui-logo-zrV4GkCMLSfBMYHKrFOhkfaOtzZxJ6.png"
                                        : "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/usd-coin-usdc-logo-wJSmP5Z7I2JTba6Bnc7jJpNujOYlb5.png"
                                    }
                                    alt={paymentData.currency}
                                    width={20}
                                    height={20}
                                  />
                                  {paymentData.currency}
                                </div>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SUI" className="flex items-center gap-2">
                              <Image
                                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sui-sui-logo-zrV4GkCMLSfBMYHKrFOhkfaOtzZxJ6.png"
                                alt="SUI"
                                width={20}
                                height={20}
                              />
                              SUI
                            </SelectItem>
                            <SelectItem value="USDC" className="flex items-center gap-2">
                              <Image
                                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/usd-coin-usdc-logo-wJSmP5Z7I2JTba6Bnc7jJpNujOYlb5.png"
                                alt="USDC"
                                width={20}
                                height={20}
                              />
                              USDC
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="payment-slug">Custom Slug (Optional)</Label>
                      <Input
                        id="payment-slug"
                        placeholder="my-link"
                        className="bg-background/50"
                        value={paymentData.slug}
                        onChange={(e) => setPaymentData({ ...paymentData, slug: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {/* Crowdfunding Form */}
                {linkType === "crowdfund" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="crowdfund-title">Title</Label>
                      <Input
                        id="crowdfund-title"
                        placeholder="Name your crowdfunding campaign..."
                        className="bg-background/50"
                        value={crowdfundData.title}
                        onChange={(e) => setCrowdfundData({ ...crowdfundData, title: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="crowdfund-description">Description</Label>
                      <Input
                        id="crowdfund-description"
                        placeholder="Describe your campaign..."
                        className="bg-background/50"
                        value={crowdfundData.description}
                        onChange={(e) => setCrowdfundData({ ...crowdfundData, description: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Goal Amount</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="0.00"
                          className="bg-background/50"
                          value={crowdfundData.goal}
                          onChange={(e) => setCrowdfundData({ ...crowdfundData, goal: e.target.value })}
                        />
                        <Select
                          value={crowdfundData.currency}
                          onValueChange={(value) => setCrowdfundData({ ...crowdfundData, currency: value })}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue>
                              {crowdfundData.currency && (
                                <div className="flex items-center gap-2">
                                  <Image
                                    src={
                                      crowdfundData.currency === "SUI"
                                        ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sui-sui-logo-zrV4GkCMLSfBMYHKrFOhkfaOtzZxJ6.png"
                                        : "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/usd-coin-usdc-logo-wJSmP5Z7I2JTba6Bnc7jJpNujOYlb5.png"
                                    }
                                    alt={crowdfundData.currency}
                                    width={20}
                                    height={20}
                                  />
                                  {crowdfundData.currency}
                                </div>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SUI" className="flex items-center gap-2">
                              <Image
                                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sui-sui-logo-zrV4GkCMLSfBMYHKrFOhkfaOtzZxJ6.png"
                                alt="SUI"
                                width={20}
                                height={20}
                              />
                              SUI
                            </SelectItem>
                            <SelectItem value="USDC" className="flex items-center gap-2">
                              <Image
                                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/usd-coin-usdc-logo-wJSmP5Z7I2JTba6Bnc7jJpNujOYlb5.png"
                                alt="USDC"
                                width={20}
                                height={20}
                              />
                              USDC
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="crowdfund-deadline">Deadline (Optional)</Label>
                      <Input
                        id="crowdfund-deadline"
                        type="date"
                        className="bg-background/50"
                        value={crowdfundData.deadline}
                        onChange={(e) => setCrowdfundData({ ...crowdfundData, deadline: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="crowdfund-slug">Custom Slug (Optional)</Label>
                      <Input
                        id="crowdfund-slug"
                        placeholder="my-campaign"
                        className="bg-background/50"
                        value={crowdfundData.slug}
                        onChange={(e) => setCrowdfundData({ ...crowdfundData, slug: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {/* Poll Form */}
                {linkType === "poll" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="poll-question">Question</Label>
                      <Input
                        id="poll-question"
                        placeholder="What do you want to ask?"
                        className="bg-background/50"
                        value={pollData.question}
                        onChange={(e) => setPollData({ ...pollData, question: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="poll-description">Description (Optional)</Label>
                      <Input
                        id="poll-description"
                        placeholder="Add more context to your question..."
                        className="bg-background/50"
                        value={pollData.description}
                        onChange={(e) => setPollData({ ...pollData, description: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Options</Label>
                        <Button variant="outline" size="sm" onClick={addPollOption} className="h-8 px-2">
                          <Plus className="h-4 w-4 mr-1" /> Add Option
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {pollData.options.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              placeholder={`Option ${index + 1}`}
                              className="bg-background/50"
                              value={option}
                              onChange={(e) => updatePollOption(index, e.target.value)}
                            />
                            {pollData.options.length > 2 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removePollOption(index)}
                                className="h-10 w-10 shrink-0"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="poll-deadline">Voting Deadline (Optional)</Label>
                      <Input
                        id="poll-deadline"
                        type="date"
                        className="bg-background/50"
                        value={pollData.deadline}
                        onChange={(e) => setPollData({ ...pollData, deadline: e.target.value })}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="allow-multiple"
                        checked={pollData.allowMultiple}
                        onCheckedChange={(checked) => setPollData({ ...pollData, allowMultiple: checked })}
                      />
                      <Label htmlFor="allow-multiple">Allow multiple selections</Label>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="poll-slug">Custom Slug (Optional)</Label>
                      <Input
                        id="poll-slug"
                        placeholder="my-poll"
                        className="bg-background/50"
                        value={pollData.slug}
                        onChange={(e) => setPollData({ ...pollData, slug: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {/* Betting Form */}
                {linkType === "betting" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="betting-title">Title</Label>
                      <Input
                        id="betting-title"
                        placeholder="Name your bet..."
                        className="bg-background/50"
                        value={bettingData.title}
                        onChange={(e) => setBettingData({ ...bettingData, title: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="betting-description">Description (Optional)</Label>
                      <Input
                        id="betting-description"
                        placeholder="Add more details about your bet..."
                        className="bg-background/50"
                        value={bettingData.description}
                        onChange={(e) => setBettingData({ ...bettingData, description: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Betting Source</Label>
                      <Select value={bettingData.source} onValueChange={handleBettingSourceChange}>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue placeholder="Select a betting source" />
                        </SelectTrigger>
                        <SelectContent>
                          {bettingSources.map((source) => (
                            <SelectItem key={source.id} value={source.id}>
                              {source.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Event</Label>
                      <Select
                        value={bettingData.eventId}
                        onValueChange={handleBettingEventChange}
                        disabled={!bettingData.source}
                      >
                        <SelectTrigger className="bg-background/50">
                          <SelectValue placeholder="Select an event" />
                        </SelectTrigger>
                        <SelectContent>
                          {bettingData.source &&
                            bettingEvents[bettingData.source as keyof typeof bettingEvents].map((event) => (
                              <SelectItem key={event.id} value={event.id}>
                                {event.name} ({event.odds}x)
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Stake</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="0.00"
                          className="bg-background/50"
                          value={bettingData.stake}
                          onChange={(e) => setBettingData({ ...bettingData, stake: e.target.value })}
                        />
                        <Select
                          value={bettingData.currency}
                          onValueChange={(value) => setBettingData({ ...bettingData, currency: value })}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue>
                              {bettingData.currency && (
                                <div className="flex items-center gap-2">
                                  <Image
                                    src={
                                      bettingData.currency === "SUI"
                                        ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sui-sui-logo-zrV4GkCMLSfBMYHKrFOhkfaOtzZxJ6.png"
                                        : "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/usd-coin-usdc-logo-wJSmP5Z7I2JTba6Bnc7jJpNujOYlb5.png"
                                    }
                                    alt={bettingData.currency}
                                    width={20}
                                    height={20}
                                  />
                                  {bettingData.currency}
                                </div>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SUI" className="flex items-center gap-2">
                              <Image
                                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sui-sui-logo-zrV4GkCMLSfBMYHKrFOhkfaOtzZxJ6.png"
                                alt="SUI"
                                width={20}
                                height={20}
                              />
                              SUI
                            </SelectItem>
                            <SelectItem value="USDC" className="flex items-center gap-2">
                              <Image
                                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/usd-coin-usdc-logo-wJSmP5Z7I2JTba6Bnc7jJpNujOYlb5.png"
                                alt="USDC"
                                width={20}
                                height={20}
                              />
                              USDC
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {bettingData.stake && bettingData.odds && (
                      <div className="p-3 bg-background/50 rounded-lg border">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Potential win</span>
                          <span className="font-medium">
                            {(Number.parseFloat(bettingData.stake) * Number.parseFloat(bettingData.odds)).toFixed(2)}{" "}
                            {bettingData.currency}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="betting-slug">Custom Slug (Optional)</Label>
                      <Input
                        id="betting-slug"
                        placeholder="my-bet"
                        className="bg-background/50"
                        value={bettingData.slug}
                        onChange={(e) => setBettingData({ ...bettingData, slug: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {/* Common Image Upload Section */}
                <div className="space-y-2">
                  <Label>Link Image (Optional)</Label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      isDragging ? "border-slingo bg-slingo/10" : "border-border"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {imagePreview ? (
                      <div className="relative w-full aspect-video">
                        <Image
                          src={imagePreview || "/placeholder.svg"}
                          alt="Preview"
                          fill
                          className="rounded-lg object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={removeImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={fileInputRef}
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleFileSelect(file)
                          }}
                        />
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="mx-auto">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Image
                        </Button>
                        <p className="text-sm text-muted-foreground mt-2">or drag and drop your image here</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  className="w-full bg-slingo hover:bg-slingo/90"
                  onClick={generateLink}
                  disabled={
                    (linkType === "payment" && (!paymentData.description || !paymentData.amount)) ||
                    (linkType === "crowdfund" && (!crowdfundData.title || !crowdfundData.goal)) ||
                    (linkType === "poll" && (!pollData.question || pollData.options.some((o) => !o))) ||
                    (linkType === "betting" && (!bettingData.title || !bettingData.eventId || !bettingData.stake))
                  }
                >
                  Generate Link
                </Button>

                {/* Link Preview */}
                {paymentLink && (
                  <div className="pt-6 border-t border-border">
                    <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg mb-4">
                      <code className="text-sm">{paymentLink}</code>
                      <Button variant="ghost" size="icon" onClick={copyToClipboard} className="h-8 w-8">
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        <span className="sr-only">Copy payment link</span>
                      </Button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex justify-center md:w-1/2">
                        <QRCodeSVG value={paymentLink} size={200} className="mx-auto" includeMargin />
                      </div>

                      <Dialog open={showPreview} onOpenChange={setShowPreview}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="md:w-1/2">
                            Preview Link
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Link Preview</DialogTitle>
                          </DialogHeader>
                          <div className="p-4 border rounded-lg">{renderLinkPreview()}</div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="bg-card/50 backdrop-blur">
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">No payment links generated yet</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
