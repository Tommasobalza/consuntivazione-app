
"use client"

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { SaveSettings, UserProfile } from "@/lib/types";
import { userIcons } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import { Download, Save, Upload, Github } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const profileFormSchema = z.object({
  name: z.string().min(2, "Il nome deve avere almeno 2 caratteri.").max(50),
  role: z.string().min(2, "Il ruolo deve avere almeno 2 caratteri.").max(50),
  icon: z.string(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface SettingsManagerProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  saveSettings: SaveSettings;
  setSaveSettings: React.Dispatch<React.SetStateAction<SaveSettings>>;
  hasPendingChanges: boolean;
  onSaveChanges: () => void;
}

const GITHUB_REPO_URL = "https://github.com/TUO_NOME_UTENTE/NOME_TUO_REPOSITORY"; // L'utente dovrà sostituire questo

export function SettingsManager({ 
  userProfile, 
  setUserProfile, 
  saveSettings, 
  setSaveSettings,
  hasPendingChanges,
  onSaveChanges
}: SettingsManagerProps) {
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: userProfile,
  });

  React.useEffect(() => {
    const subscription = profileForm.watch((value) => {
      setUserProfile(value as UserProfile);
    });
    return () => subscription.unsubscribe();
  }, [profileForm, setUserProfile]);
  
  const handleAutoSaveChange = (checked: boolean) => {
    setSaveSettings({ autoSave: checked });
  };
  
  const CurrentIcon = userIcons[userProfile.icon as keyof typeof userIcons] || userIcons.User;

  const handleExportData = () => {
    try {
      const dataToExport = {
        'daily-tasks': JSON.parse(localStorage.getItem('daily-tasks') || '[]'),
        'activity-tags': JSON.parse(localStorage.getItem('activity-tags') || '[]'),
        'leave-days': JSON.parse(localStorage.getItem('leave-days') || '[]'),
        'user-profile': JSON.parse(localStorage.getItem('user-profile') || '{}'),
        'save-settings': JSON.parse(localStorage.getItem('save-settings') || '{}'),
      };
      const jsonString = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "consuntivazione_backup.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: "Esportazione completata",
        description: "I tuoi dati sono stati salvati nel file consuntivazione_backup.json.",
      });
    } catch (error) {
      console.error("Errore durante l'esportazione dei dati:", error);
      toast({
        title: "Esportazione fallita",
        description: "Si è verificato un errore durante l'esportazione dei dati.",
        variant: "destructive",
      });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("File non valido");
        const data = JSON.parse(text);
        
        // Validazione base
        const requiredKeys = ['daily-tasks', 'activity-tags', 'leave-days', 'user-profile', 'save-settings'];
        const dataKeys = Object.keys(data);
        if (!requiredKeys.every(key => dataKeys.includes(key))) {
            throw new Error("Il file di backup non ha un formato valido.");
        }

        // Sovrascrivi localStorage
        Object.keys(data).forEach(key => {
            localStorage.setItem(key, JSON.stringify(data[key]));
        });

        toast({
          title: "Importazione completata",
          description: "I tuoi dati sono stati ripristinati. La pagina verrà ricaricata.",
        });

        // Ricarica la pagina per applicare le modifiche
        setTimeout(() => {
          window.location.reload();
        }, 1500);

      } catch (error) {
        console.error("Errore durante l'importazione dei dati:", error);
        toast({
          title: "Importazione fallita",
          description: (error as Error).message || "Il file selezionato non è un backup valido.",
          variant: "destructive",
        });
      } finally {
        // Resetta l'input per permettere di ricaricare lo stesso file
        if(event.target) event.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Profilo Utente</CardTitle>
          <CardDescription>
            Personalizza le tue informazioni e il tuo avatar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback>
                    <CurrentIcon className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-grow space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Il tuo nome" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ruolo</FormLabel>
                        <FormControl>
                          <Input placeholder="Es: Sviluppatore" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <FormField
                control={profileForm.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seleziona Icona</FormLabel>
                    <FormControl>
                        <div className="flex flex-wrap gap-2 pt-2">
                        {Object.keys(userIcons).map((iconKey) => {
                          const IconComponent = userIcons[iconKey as keyof typeof userIcons];
                          return (
                              <button
                              type="button"
                              key={iconKey}
                              onClick={() => field.onChange(iconKey)}
                              className={`p-2 rounded-md border-2 ${field.value === iconKey ? 'border-primary' : 'border-border'}`}
                              >
                              <IconComponent className="h-5 w-5" />
                              </button>
                          );
                        })}
                        </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        <Card>
            <CardHeader>
            <CardTitle>Tema Applicazione</CardTitle>
            <CardDescription>
                Scegli tra tema chiaro, scuro o di sistema.
            </CardDescription>
            </CardHeader>
            <CardContent>
                <ThemeToggle />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
            <CardTitle>Impostazioni di Salvataggio</CardTitle>
            <CardDescription>
                Scegli come salvare le tue modifiche.
            </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 rounded-md border p-4">
                  <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                      Salvataggio Automatico
                      </p>
                      <p className="text-sm text-muted-foreground">
                      Salva automaticamente le modifiche.
                      </p>
                  </div>
                  <Switch
                      checked={saveSettings.autoSave}
                      onCheckedChange={handleAutoSaveChange}
                  />
              </div>
            </CardContent>
             {!saveSettings.autoSave && hasPendingChanges && (
                <CardFooter className="pt-4">
                    <div className="flex flex-col gap-2 w-full">
                         <p className="text-sm text-muted-foreground">
                            Hai delle modifiche non salvate.
                         </p>
                        <Button onClick={onSaveChanges} className="w-full">
                            <Save className="mr-2 h-4 w-4" />
                            Salva Tutte le Modifiche
                        </Button>
                    </div>
                </CardFooter>
            )}
        </Card>
      </div>

       <div className="space-y-6">
        <Card>
            <CardHeader>
            <CardTitle>Gestione Dati</CardTitle>
            <CardDescription>
                Salva i tuoi dati in un file per backup o per trasferirli.
            </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <Button onClick={handleExportData} variant="outline">
                    <Download className="mr-2 h-4 w-4"/>
                    Esporta Dati
               </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button>
                        <Upload className="mr-2 h-4 w-4"/>
                        Importa Dati
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Sei sicuro di voler importare i dati?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Questa azione sovrascriverà tutti i dati attuali (attività, tag, impostazioni) con quelli contenuti nel file di backup. L'operazione non può essere annullata.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annulla</AlertDialogCancel>
                      <AlertDialogAction onClick={handleImportClick}>Continua e Seleziona File</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
               <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="application/json"
                onChange={handleFileChange}
              />
            </CardContent>
        </Card>

         <Card>
            <CardHeader>
            <CardTitle>Codice Sorgente</CardTitle>
            <CardDescription>
                Scarica il codice sorgente dell'applicazione da GitHub.
            </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer">
                    <Github className="mr-2 h-4 w-4"/>
                    Vai al Repository
                </a>
              </Button>
            </CardContent>
            <CardFooter>
                <p className="text-xs text-muted-foreground">
                    Assicurati di aver caricato il progetto su GitHub e di aver aggiornato l'URL nel codice.
                </p>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}
