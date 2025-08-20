"use client";
import { useForm } from "react-hook-form";
import { TypographyH1, TypographyP, TypographyH2 } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { IconMail, IconPhone, IconMapPin } from "@tabler/icons-react";

export default function ContactPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data: any) => {
    // Simulate API call
    await new Promise(res => setTimeout(res, 600));
    toast.success("Message sent! We'll get back to you soon.");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <TypographyH1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
          Get in Touch
        </TypographyH1>
        <TypographyP className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Have questions or feedback? We'd love to hear from you. Our team is here to help and answer any questions you might have.
        </TypographyP>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-background/50">
          <CardHeader>
            <TypographyH2 className="text-xl font-semibold">Contact Information</TypographyH2>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <IconMail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Email</h3>
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
                <IconPhone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Phone</h3>
                <a 
                  href="tel:+212610454716" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  +212 6 10 45 47 16
                </a>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <IconMapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Location</h3>
                <p className="text-muted-foreground">
                  Casablanca, Morocco
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background/50">
          <CardHeader>
            <TypographyH2 className="text-xl font-semibold">Send us a Message</TypographyH2>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <Label htmlFor="name" className="text-foreground">Full Name</Label>
                <Input 
                  id="name" 
                  placeholder="Your Name" 
                  {...register("name", { required: true })} 
                  aria-invalid={!!errors.name} 
                  className="mt-1"
                />
                {errors.name && <p className="text-destructive text-sm mt-1">Please enter your name</p>}
              </div>
              
              <div>
                <Label htmlFor="email" className="text-foreground">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@email.com" 
                  {...register("email", { 
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  })} 
                  aria-invalid={!!errors.email}
                  className="mt-1"
                />
                {errors.email && <p className="text-destructive text-sm mt-1">{String(errors.email.message)}</p>}
              </div>
              
              <div>
                <Label htmlFor="message" className="text-foreground">Your Message</Label>
                <Textarea 
                  id="message" 
                  rows={5} 
                  placeholder="How can we help you?" 
                  {...register("message", { 
                    required: "Message is required",
                    minLength: {
                      value: 10,
                      message: "Message must be at least 10 characters"
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
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
