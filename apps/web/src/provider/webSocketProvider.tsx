import { useEffect, useState, type ReactNode } from 'react'
import { io, type Socket } from 'socket.io-client'
import { WebSocketContext } from '../context/WebSocketContext'

const socketUrl = import.meta.env.VITE_API_URL
const socket: Socket = io(socketUrl, { autoConnect: false })

interface WebSocketProviderProps {
  children: ReactNode
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [connected, setConnected] = useState(socket.connected)

  useEffect(() => {
    const handleConnect = () => setConnected(true)
    const handleDisconnect = () => setConnected(false)

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.connect()

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.disconnect()
      setConnected(false)
    }
  }, [])

  return (
    <WebSocketContext.Provider value={{ socket, connected }}>
      {children}
    </WebSocketContext.Provider>
  )
}