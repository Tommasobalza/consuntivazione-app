
"use client"

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { SaveSettings, UserProfile } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

const profileFormSchema = z.object({
  name: z.string().min(2, "Il nome deve avere almeno 2 caratteri.").max(50),
  role: z.string().min(2, "Il ruolo deve avere almeno 2 caratteri.").max(50),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface SettingsManagerProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  saveSettings: SaveSettings;
  setSaveSettings: React.Dispatch<React.SetStateAction<SaveSettings>>;
}

export function SettingsManager({ 
  userProfile, 
  setUserProfile, 
  saveSettings, 
  setSaveSettings 
}: SettingsManagerProps) {
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
    // This change will be picked up by the dashboard to trigger a save if autoSave is re-enabled
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Profilo Utente</CardTitle>
          <CardDescription>
            Personalizza le tue informazioni. Saranno visualizzate nell'intestazione.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarFallback>
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-grow">
               <Form {...profileForm}>
                <form className="space-y-4">
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
                </form>
              </Form>
            </div>
          </div>
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
                  Salva automaticamente le modifiche mentre lavori.
                </p>
              </div>
              <Switch
                checked={saveSettings.autoSave}
                onCheckedChange={handleAutoSaveChange}
                aria-readonly
              />
            </div>
            {!saveSettings.autoSave && (
                <p className="text-sm text-muted-foreground mt-4">
                    Sei in modalità di salvataggio manuale. Ricorda di cliccare su "Salva Modifiche" per non perdere il tuo lavoro.
                </p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
