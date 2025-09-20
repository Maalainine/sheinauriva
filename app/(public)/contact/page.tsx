"use client";
import { useForm } from "react-hook-form";
import { useTranslations } from "@/hooks/useTranslations";
import { TypographyH1, TypographyP, TypographyH2 } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { IconMail, IconMapPin } from "@tabler/icons-react";

export default function ContactPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { t } = useTranslations();

  const onSubmit = async (data: any) => {
    // Simulate API call
    await new Promise(res => setTimeout(res, 600));
    toast.success(t('contact.messageSent'));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <TypographyH1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
          {t('contact.title')}
        </TypographyH1>
        <TypographyP className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('contact.subtitle')}
        </TypographyP>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-background/50">
          <CardHeader>
            <TypographyH2 className="text-xl font-semibold">{t('contact.contactInfo')}</TypographyH2>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <IconMail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">{t('contact.email')}</h3>
                <a 
                  href="mailto:contact@JustOriginale.com" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  contact@JustOriginale.com
                </a>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <IconMapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">{t('contact.location')}</h3>
                <p className="text-muted-foreground">
                  Settat, Morocco
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background/50">
          <CardHeader>
            <TypographyH2 className="text-xl font-semibold">{t('contact.sendMessage')}</TypographyH2>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <Label htmlFor="name" className="text-foreground">{t('contact.fields.fullName')}</Label>
                <Input 
                  id="name" 
                  placeholder={t('contact.placeholders.name')} 
                  {...register("name", { required: true })} 
                  aria-invalid={!!errors.name} 
                  className="mt-1"
                />
                {errors.name && <p className="text-destructive text-sm mt-1">{t('contact.validation.nameRequired')}</p>}
              </div>
              
              <div>
                <Label htmlFor="email" className="text-foreground">{t('contact.fields.email')}</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder={t('contact.placeholders.email')} 
                  {...register("email", { 
                    required: t('contact.validation.emailRequired'),
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: t('contact.validation.emailInvalid')
                    }
                  })} 
                  aria-invalid={!!errors.email}
                  className="mt-1"
                />
                {errors.email && <p className="text-destructive text-sm mt-1">{String(errors.email.message)}</p>}
              </div>
              
              <div>
                <Label htmlFor="message" className="text-foreground">{t('contact.fields.message')}</Label>
                <Textarea 
                  id="message" 
                  rows={5} 
                  placeholder={t('contact.placeholders.message')} 
                  {...register("message", { 
                    required: t('contact.validation.messageRequired'),
                    minLength: {
                      value: 10,
                      message: t('contact.validation.messageMinLength')
                    }
                  })} 
                  aria-invalid={!!errors.message}
                  className="mt-1"
                />
                {errors.message && <p className="text-destructive text-sm mt-1">{String(errors.message.message)}</p>}
              </div>
              
              <Button 
                type="submit" 
                className="w-full mt-2" 
                disabled={isSubmitting}
              >
                {isSubmitting ? t('contact.sending') : t('contact.sendButton')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
