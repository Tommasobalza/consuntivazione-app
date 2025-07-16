
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
import { Save } from "lucide-react";

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

export function SettingsManager({ 
  userProfile, 
  setUserProfile, 
  saveSettings, 
  setSaveSettings,
  hasPendingChanges,
  onSaveChanges
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
  };
  
  const CurrentIcon = userIcons[userProfile.icon as keyof typeof userIcons] || userIcons.User;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      Salva automaticamente le modifiche in background.
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
                            Hai delle modifiche non salvate. Clicca qui per salvarle.
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
    </div>
  );
}
