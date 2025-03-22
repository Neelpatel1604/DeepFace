"use client"

import { useState, useEffect, useRef } from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Shield, Activity } from "lucide-react"

export default function Home() {
  const [connected, setConnected] = useState(false)
  const [perturbationStrength, setPerturbationStrength] = useState(50)
  const [noiseScale, setNoiseScale] = useState(30)
  const [patternDensity, setPatternDensity] = useState(40)
  const [previewUrl, setPreviewUrl] = useState("")
  const socketRef = useRef<WebSocket | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Connect to the WebSocket server when the component mounts
    const connectWebSocket = () => {
      const ws = new WebSocket("ws://localhost:4444")

      ws.onopen = () => {
        console.log("Connected to OBS WebSocket")
        setConnected(true)
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === "preview") {
          setPreviewUrl(data.url)
        }
      }

      ws.onclose = () => {
        console.log("Disconnected from OBS WebSocket")
        setConnected(false)
        // Try to reconnect after a delay
        setTimeout(connectWebSocket, 3000)
      }

      ws.onerror = (error) => {
        console.error("WebSocket error:", error)
        ws.close()
      }

      socketRef.current = ws
    }

    connectWebSocket()

    // Clean up the WebSocket connection when the component unmounts
    return () => {
      if (socketRef.current) {
        socketRef.current.close()
      }
    }
  }, [])

  // Send updated filter settings to the WebSocket server
  useEffect(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: "updateFilter",
          settings: {
            perturbationStrength,
            noiseScale,
            patternDensity,
          },
        }),
      )
    }
  }, [perturbationStrength, noiseScale, patternDensity])

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Adversarial Perturbation Filter</h1>
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`}></div>
              <span>{connected ? "Connected to OBS" : "Disconnected"}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle>Live Preview</CardTitle>
                  <CardDescription>Preview of the stream with adversarial perturbation applied</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="relative bg-black aspect-video w-full">
                    {previewUrl ? (
                      <video ref={videoRef} src={previewUrl} autoPlay muted className="w-full h-full object-contain" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No preview available. Make sure OBS is connected.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Tabs defaultValue="filters">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="filters">
                    <Shield className="h-4 w-4 mr-2" />
                    Filters
                  </TabsTrigger>
                  <TabsTrigger value="settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </TabsTrigger>
                  <TabsTrigger value="stats">
                    <Activity className="h-4 w-4 mr-2" />
                    Stats
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="filters">
                  <Card>
                    <CardHeader>
                      <CardTitle>Perturbation Controls</CardTitle>
                      <CardDescription>Adjust the strength and pattern of the adversarial filter</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <label htmlFor="strength" className="text-sm font-medium">
                            Perturbation Strength
                          </label>
                          <span className="text-sm text-gray-500">{perturbationStrength}%</span>
                        </div>
                        <Slider
                          id="strength"
                          min={0}
                          max={100}
                          step={1}
                          value={[perturbationStrength]}
                          onValueChange={(value) => setPerturbationStrength(value[0])}
                        />
                        <p className="text-xs text-gray-500">
                          Controls how strong the adversarial pattern appears in the video
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <label htmlFor="noise" className="text-sm font-medium">
                            Noise Scale
                          </label>
                          <span className="text-sm text-gray-500">{noiseScale}%</span>
                        </div>
                        <Slider
                          id="noise"
                          min={0}
                          max={100}
                          step={1}
                          value={[noiseScale]}
                          onValueChange={(value) => setNoiseScale(value[0])}
                        />
                        <p className="text-xs text-gray-500">Adjusts the scale of the noise pattern</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <label htmlFor="density" className="text-sm font-medium">
                            Pattern Density
                          </label>
                          <span className="text-sm text-gray-500">{patternDensity}%</span>
                        </div>
                        <Slider
                          id="density"
                          min={0}
                          max={100}
                          step={1}
                          value={[patternDensity]}
                          onValueChange={(value) => setPatternDensity(value[0])}
                        />
                        <p className="text-xs text-gray-500">Controls how dense the adversarial pattern is</p>
                      </div>

                      <Button className="w-full" disabled={!connected}>
                        Apply to Stream
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle>Connection Settings</CardTitle>
                      <CardDescription>Configure OBS WebSocket connection</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Host</label>
                          <input
                            type="text"
                            defaultValue="localhost"
                            className="w-full mt-1 px-3 py-2 border rounded-md"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Port</label>
                          <input
                            type="number"
                            defaultValue="4444"
                            className="w-full mt-1 px-3 py-2 border rounded-md"
                          />
                        </div>
                      </div>
                      <Button variant="outline" className="w-full">
                        Reconnect
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="stats">
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Stats</CardTitle>
                      <CardDescription>Real-time performance metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Processing Time</span>
                            <span className="font-mono">12.4ms</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-green-500 w-[37%]"></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Frame Rate</span>
                            <span className="font-mono">60fps</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-blue-500 w-[100%]"></div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                            <div className="text-xs text-gray-500">GPU Usage</div>
                            <div className="text-xl font-semibold">42%</div>
                          </div>
                          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                            <div className="text-xs text-gray-500">Memory</div>
                            <div className="text-xl font-semibold">256MB</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

