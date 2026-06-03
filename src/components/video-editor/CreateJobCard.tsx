import { useState } from 'react';
import { useStartJob } from '@/hooks/useKlap';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Sparkles, Loader2 } from 'lucide-react';

export default function CreateJobCard() {
  const [url, setUrl] = useState('');
  const [mode, setMode] = useState<'shorts' | 'video'>('shorts');
  const [language, setLanguage] = useState('auto');
  const [targetClips, setTargetClips] = useState<number>(10);
  const [maxDuration, setMaxDuration] = useState<number>(60);
  const [captions, setCaptions] = useState(true);
  const [reframe, setReframe] = useState(true);
  const [emojis, setEmojis] = useState(false);
  const [introTitle, setIntroTitle] = useState(true);
  const [removeSilences, setRemoveSilences] = useState(true);
  const [context, setContext] = useState('');
  const [open, setOpen] = useState(false);
  const start = useStartJob();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^https:\/\/.+/i.test(url)) return;
    start.mutate({
      mode,
      source_video_url: url.trim(),
      language,
      target_clip_count: mode === 'shorts' ? targetClips : undefined,
      max_duration: mode === 'shorts' ? maxDuration : undefined,
      editing_options: {
        captions, reframe, emojis, intro_title: introTitle, remove_silences: removeSilences,
      },
      dimensions: { width: 1080, height: 1920 },
      transcription_context: context.trim() || undefined,
    });
    if (!start.isError) setUrl('');
  };

  return (
    <Card className="p-6 backdrop-blur bg-card/60 border-border/40">
      <form onSubmit={submit} className="space-y-5">
        <div className="grid sm:grid-cols-[1fr,200px] gap-3">
          <div className="space-y-2">
            <Label htmlFor="video-url">URL do vídeo</Label>
            <Input
              id="video-url"
              type="url"
              placeholder="https://youtu.be/... ou link MP4 público"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              maxLength={2048}
            />
          </div>
          <div className="space-y-2">
            <Label>Modo</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as 'shorts' | 'video')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="shorts">Cortes automáticos</SelectItem>
                <SelectItem value="video">Editar vídeo único</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="gap-2">
              <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
              Opções avançadas
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4">
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Idioma</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Detectar</SelectItem>
                    <SelectItem value="pt">Português</SelectItem>
                    <SelectItem value="en">Inglês</SelectItem>
                    <SelectItem value="es">Espanhol</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {mode === 'shorts' && (
                <>
                  <div className="space-y-2">
                    <Label>Nº de cortes alvo</Label>
                    <Input type="number" min={1} max={30} value={targetClips}
                      onChange={(e) => setTargetClips(Number(e.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Duração máx. (s)</Label>
                    <Input type="number" min={10} max={180} value={maxDuration}
                      onChange={(e) => setMaxDuration(Number(e.target.value))} />
                  </div>
                </>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <ToggleRow label="Legendas" checked={captions} onChange={setCaptions} />
              <ToggleRow label="Reframe vertical" checked={reframe} onChange={setReframe} />
              <ToggleRow label="Emojis" checked={emojis} onChange={setEmojis} />
              <ToggleRow label="Título de abertura" checked={introTitle} onChange={setIntroTitle} />
              <ToggleRow label="Remover silêncios" checked={removeSilences} onChange={setRemoveSilences} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ctx">Contexto da transcrição (opcional)</Label>
              <Textarea id="ctx" rows={3} maxLength={1000}
                placeholder="Ex.: este é um sermão sobre fé, mencionando nomes próprios..."
                value={context} onChange={(e) => setContext(e.target.value)} />
              <p className="text-xs text-muted-foreground">{context.length}/1000</p>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Button type="submit" disabled={start.isPending || !url} className="w-full sm:w-auto gap-2">
          {start.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {mode === 'shorts' ? 'Gerar cortes' : 'Editar vídeo'}
        </Button>
      </form>
    </Card>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/40 px-3 py-2">
      <Label className="cursor-pointer">{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
