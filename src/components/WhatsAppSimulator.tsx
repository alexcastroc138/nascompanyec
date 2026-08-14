import React, { useState, useEffect, useRef } from 'react';
import { Send, CheckCheck, Smartphone, Bot, Sparkles, User, FileJson, AlertCircle } from 'lucide-react';
import { Appointment, SaleItem, Sale } from '../types';
import { getLocalISOString, getTodayStr } from '../utils/dateUtils';
import { useCaja } from '../context/CajaContext';

interface WhatsAppSimulatorProps {
  onAddAppointment: (appt: Appointment) => void;
  onAddSale: (sale: any) => void;
  onAddLog: (log: any) => void;
}

export default function WhatsAppSimulator({ onAddAppointment, onAddSale, onAddLog }: WhatsAppSimulatorProps) {
  const { turnoId, isCajaAbierta } = useCaja();
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; json?: string; timestamp: string }>>([
    {
      sender: 'bot',
      text: '¡Hola! Bienvenido al canal oficial de nuestro Estudio de Tatuajes y Piercings. Soy tu Asistente Virtual Oficial. 🤙 Aquí puedo cotizarte, resolver tus dudas de cuidados o coordinar tu cita en segundos.',
      timestamp: '11:45'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [actionTriggered, setActionTriggered] = useState<{ type: string; message: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const presets = [
    {
      label: '📅 Agendar Cita (Piercing)',
      text: 'Hola, soy Francisco. Quisiera agendar una perforación de Septum con Ámbar para mañana de tarde, digamos 15:30. Mi número es 0998887766.',
      response: '¡Hola Francisco! Qué buena elección. Un piercing Septum con titanio de primera mano es excelente. Ámbar tiene libre precisamente mañana a las 15:30. Te acabo de registrar provisionalmente. El sistema n8n ya está procesando la reserva e insertándola automáticamente en nuestro calendario Amelia.',
      json: {
        action: "book_appointment",
        customer_name: "Francisco Septum",
        customer_phone: "0998887766",
        service: "Perforación Septum (Titanio)",
        date: "tomorrow", // to be resolved in handler
        time: "15:30",
        artist: "Ámbar Piercing",
        status: "pending_confirmation"
      }
    },
    {
      label: '💵 Venta Interna (Especialista)',
      text: 'Ambar: Hola, por favor registra que acabo de realizar una perforación hélix básico ($25) y vendí un Suero fisiológico Spray ($14.50), cobrado en efectivo. Por favor descuenta de inventario y súmalo a mis comisiones.',
      response: '¡Entendido, Ámbar! He registrado la venta en el POS del sistema. Subtotal: $39.50. He generado tu comisión del 40% sobre el servicio de perforación ($10.00). El stock del suero y joyería de titanio se descuenta automáticamente a través del webhook de n8n.',
      json: {
        action: "register_sale",
        employee: "Ámbar Piercing",
        items: [
          { itemId: "p1", name: "Perforación Hélix Básico (Titanio)", price: 25, quantity: 1, category: "piercing" },
          { itemId: "a2", name: "Suero Fisiológico Spray NeilMed 75ml", price: 14.5, quantity: 1, category: "aftercare" }
        ],
        payment_method: "cash",
        deduct_inventory: true
      }
    },
    {
      label: '📝 Duda de Cuidados (Ecuador)',
      text: 'Hola, me acabo de hacer un piercing hoy contigo. ¿Cuáles son los cuidados y qué hago si me duele?',
      response: '¡Hola! Felicidades por tu pieza. Los cuidados clave son: 1) Limpia 2 o 3 veces al día con suero fisiológico en spray (NeilMed es ideal). 2) Lava con abundante agua y jabón neutro en la ducha, sin girar la joya. 3) Jamás uses alcohol, agua oxigenada o cremas grasosas. ¡La sanación total toma unos meses! Si tienes fiebre o supuración verdosa escríbenos de inmediato.',
      json: null
    }
  ];

  const handleSend = (textToSend: string, jsonToTrigger?: any) => {
    if (!textToSend.trim()) return;

    // Add user message
    const currentTime = new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
    const userMsg = { sender: 'user' as const, text: textToSend, timestamp: currentTime };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate Bot Response after 1.5s
    setTimeout(() => {
      setIsTyping(false);
      let replyText = '¡Claro que sí! Procesando tu solicitud de servicio corporal.';
      let generatedJson: string | undefined = undefined;

      // Handle preset logic or approximate keywords
      const lower = textToSend.toLowerCase();
      if (jsonToTrigger) {
        // Direct preset match passed
        const found = presets.find(p => p.text === textToSend);
        replyText = found ? found.response : 'Acción completada con éxito.';
        generatedJson = JSON.stringify(jsonToTrigger, null, 2);
        triggerHookAction(jsonToTrigger);
      } else {
        // Freeform input analysis
        if (lower.includes('agendar') || lower.includes('cita') || lower.includes('perforar') || lower.includes('perforación') || lower.includes('tatuaje')) {
          replyText = '¡Perfecto! Veo que te interesa agendar una sesión. He extraído los parámetros clave del mensaje y los estoy enviando en formato JSON al webhook de n8n para agendar tu cita de inmediato.';
          const mockJson = {
            action: "book_appointment",
            customer_name: "Cliente WhatsApp",
            customer_phone: "+593 99 999 9999",
            service: lower.includes('tatuaje') ? "Tatuaje Minimalista" : "Perforación Hélix Básico (Titanio)",
            date: "2026-05-25",
            time: "14:00",
            artist: lower.includes('carlos') ? "Carlos Ink" : "Ámbar Piercing",
            status: "pending_confirmation"
          };
          generatedJson = JSON.stringify(mockJson, null, 2);
          triggerHookAction(mockJson);
        } else if (lower.includes('registrar') || lower.includes('venta') || lower.includes('vendi')) {
          replyText = '¡Excelente, venta procesada! He estructurado el registro de venta POS para que n8n sincronice la factura, descuente stock y registre tu comisión automáticamente.';
          const mockJson = {
            action: "register_sale",
            employee: "Ámbar Piercing",
            items: [{ itemId: "p2", name: "Perforación Nostril (Titanio)", price: 30, quantity: 1, category: "piercing" }],
            payment_method: "cash",
            deduct_inventory: true
          };
          generatedJson = JSON.stringify(mockJson, null, 2);
          triggerHookAction(mockJson);
        } else {
          replyText = 'He consultado nuestra base de conocimientos de cuidados corporales. Recuerda que las perforaciones básicas en Ecuador cuestan $20 USD base con joya de titanio incluida de grado implantable. Los tatuajes dependen de cotización según diseño y tamaño. Mantén tu pieza limpia con jabón PH neutro y suero de spray.';
        }
      }

      setMessages(prev => [...prev, {
        sender: 'bot',
        text: replyText,
        json: generatedJson,
        timestamp: new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1200);
  };

  const triggerHookAction = (json: any) => {
    const timestampIso = getLocalISOString();
    
    if (json.action === 'book_appointment') {
      // Create tomorrow date mathematically
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const newAppt: Appointment = {
        id: 'ap_wa_' + Math.floor(Math.random() * 1000),
        customerName: json.customer_name,
        customerPhone: json.customer_phone || '+593 99 111 2222',
        date: json.date === 'tomorrow' ? tomorrowStr : json.date,
        time: json.time,
        duration: 45,
        specialistId: json.artist.includes('Carlos') ? '2' : '1',
        specialistName: json.artist,
        service: json.service,
        price: json.service.includes('Septum') ? 35.00 : 25.00,
        status: 'pending'
      };

      // Call handler
      onAddAppointment(newAppt);

      // Trigger log
      onAddLog({
        id: 'log_wa_' + Date.now(),
        timestamp: timestampIso,
        source: 'WhatsApp',
        message: `Cita recibida desde WhatsApp de ${json.customer_name}`,
        extractedJson: JSON.stringify(json, null, 2),
        result: `Cita insertada automáticamente por n8n en el Calendario. Artista: ${json.artist}`,
        status: 'success'
      });

      // Show temporary banner
      setActionTriggered({
        type: 'appointment',
        message: `⚡ n8n Webhook Activado: Cita registrada para ${json.customer_name} con ${json.artist} a las ${json.time}!`
      });
      setTimeout(() => setActionTriggered(null), 5000);

    } else if (json.action === 'register_sale') {
      // Find artist
      const artistName = json.employee || 'Ámbar Piercing';
      const saleId = 's_wa_' + Math.floor(Math.random() * 1000);
      
      const newSale: Sale = {
        id: saleId,
        specialistId: artistName.includes('Carlos') ? '2' : '1',
        specialistName: artistName,
        turnoId: isCajaAbierta && turnoId ? turnoId : undefined,
        customerName: 'Cliente Rápido WhatsApp',
        customerId: '9999999999', // Consumidor final
        customerEmail: 'final@estudio.ec',
        customerAddress: 'Estudio de Tatuajes, Ecuador',
        items: json.items.map((i: any) => ({
          itemId: i.itemId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          category: i.category
        })),
        subtotal: json.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0),
        commission: json.items.reduce((sum: number, item: any) => {
          // 40% on piercing, 50% on tattoo, zero on retail/jewelry/aftercare
          if (item.category === 'piercing') return sum + (item.price * 0.40);
          if (item.category === 'tattoo') return sum + (item.price * 0.50);
          return sum;
        }, 0),
        paymentMethod: json.payment_method || 'cash',
        timestamp: timestampIso,
        sriStatus: 'enviado_sri',
        invoiceNumber: `001-002-00000${Math.floor(Math.random() * 10000 + 1000)}`
      };

      onAddSale(newSale);

      // Trigger log
      onAddLog({
        id: 'log_wa_' + Date.now(),
        timestamp: timestampIso,
        source: 'n8n_flow',
        message: `Venta detectada en chat de ${artistName}`,
        extractedJson: JSON.stringify(json, null, 2),
        result: `Venta registrada de $${newSale.subtotal.toFixed(2)} USD. Comisión calculada de $${newSale.commission.toFixed(2)} USD asignada.`,
        status: 'success'
      });

      // Show temporary banner
      setActionTriggered({
        type: 'sale',
        message: `⚡ n8n Webhook: Venta de $${newSale.subtotal.toFixed(2)} USD unificada. ¡Completado!`
      });
      setTimeout(() => setActionTriggered(null), 5000);
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden flex flex-col h-[580px] lg:h-[620px]">
      {/* Target header */}
      <div className="bg-slate-950 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-bold relative">
              <Bot size={18} className="text-emerald-400" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-950 rounded-full" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h3 className="text-sm font-semibold tracking-tight font-display text-white">Asistente Virtual</h3>
              <Sparkles size={11} className="text-emerald-400" />
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Soporte IA & WhatsApp n8n
            </p>
          </div>
        </div>
        <div className="px-2.5 py-0.5 bg-emerald-950 text-emerald-400 rounded-full text-[8px] uppercase font-extrabold tracking-wider border border-emerald-900/60 font-mono">
          Ecuador Live
        </div>
      </div>

      {/* Action triggered banner */}
      {actionTriggered && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs font-medium text-emerald-800 animate-pulse flex items-center space-x-2">
          <Sparkles size={14} className="text-emerald-600 flex-shrink-0" />
          <span>{actionTriggered.message}</span>
        </div>
      )}

      {/* Messages body */}
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-neutral-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <span className="text-xs text-neutral-400 mb-0.5 font-medium px-1 flex items-center space-x-0.5">
              {m.sender === 'user' ? (
                <>
                  <span>Tú</span>
                  <User size={10} />
                </>
              ) : (
                <>
                  <Bot size={10} className="text-emerald-600" />
                  <span>Estudio Bot</span>
                </>
              )}
            </span>
            <div className={`p-3 max-w-[85%] rounded-2xl text-xs leading-relaxed ${
              m.sender === 'user' 
                ? 'bg-neutral-800 text-white rounded-tr-none' 
                : 'bg-white border border-neutral-200/80 shadow-xs rounded-tl-none text-neutral-800'
            }`}>
              <p>{m.text}</p>

              {/* Parsed JSON panel */}
              {m.json && (
                <div className="mt-3 bg-neutral-900 rounded-lg p-2.5 font-mono text-xs text-emerald-400 border border-neutral-800">
                  <div className="flex items-center justify-between text-xs text-neutral-400 pb-1.5 mb-1.5 border-b border-neutral-800/60 font-sans">
                    <span className="flex items-center space-x-1">
                      <FileJson size={10} />
                      <span>Extracción JSON (SRI/Cita)</span>
                    </span>
                    <span className="text-emerald-500 font-bold uppercase text-[8px] tracking-widest px-1 py-0.2 bg-emerald-900/30 rounded border border-emerald-800">n8n Validated</span>
                  </div>
                  <pre className="overflow-x-auto select-all">{m.json}</pre>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-0.5 text-xs text-neutral-400 mt-1 px-1">
              <span>{m.timestamp}</span>
              {m.sender === 'user' && <CheckCheck size={12} className="text-emerald-500" />}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex flex-col items-start">
            <span className="text-xs text-neutral-400 mb-0.5 font-medium px-1">Asistente AI</span>
            <div className="bg-white border border-neutral-100 p-3 rounded-2xl rounded-tl-none shadow-xs text-xs">
              <span className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-xs text-neutral-400 font-medium pl-1">Ámbar AI planificando...</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Preset selector */}
      <div className="p-3 bg-white border-t border-neutral-100">
        <label className="text-xs uppercase tracking-wider font-extrabold text-neutral-400 block mb-2">Simular Entradas de Cliente (WhatsApp)</label>
        <div className="flex flex-col space-y-1.5 max-h-[110px] overflow-y-auto">
          {presets.map((p, index) => (
            <button
              key={index}
              onClick={() => handleSend(p.text, p.json)}
              className="text-left py-1.5 px-2.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/60 rounded-lg text-[11px] font-semibold text-neutral-800 transition flex items-center justify-between"
            >
              <span>{p.label}</span>
              <span className="text-xs text-neutral-400 max-w-[50%] truncate font-normal italic pr-1">
                "{p.text}"
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom messaging inputs */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputText);
        }}
        className="p-3 bg-slate-50 border-t border-slate-100 flex items-center space-x-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Escribir un mensaje de prueba..."
          className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-transparent"
        />
        <button
          type="submit"
          className="p-2.5 bg-black hover:bg-slate-800 text-white rounded-xl transition cursor-pointer"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
