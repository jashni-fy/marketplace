'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// @ts-ignore
import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera } from 'lucide-react';
import { toast } from 'sonner';

export default function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('customer');
  
  // Vendor specific fields
  const [businessName, setBusinessName] = useState('');
  const [location, setLocation] = useState('');

  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const userData: any = { 
      email, 
      password, 
      password_confirmation: confirmPassword,
      first_name: firstName,
      last_name: lastName,
      role 
    };

    if (role === 'vendor') {
      userData.vendor_profile_attributes = {
        business_name: businessName,
        location: location
      };
    }

    try {
      const result = await register(userData);
      
      if (result.success) {
        toast.success(result.message || 'Account created successfully!');
        router.push('/marketplace');
      } else {
        const errorMsg = typeof result.error === 'string' ? result.error : 'Registration failed';
        toast.error(errorMsg);
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border shadow-sm">
        <CardHeader className="space-y-1 text-center pb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Camera className="size-8 text-foreground" strokeWidth={1.5} />
            <h1 className="text-3xl font-light tracking-tight">jashnify</h1>
          </div>
          <CardTitle className="text-2xl font-light">Create an account</CardTitle>
          <CardDescription className="font-light">
            Join us to book amazing photographers for your events
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="font-normal">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="font-normal">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="font-normal">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-normal">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="font-normal">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-normal">I am a</Label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-11 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="customer">Customer</option>
                <option value="vendor">Photographer</option>
              </select>
            </div>

            {role === 'vendor' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="businessName" className="font-normal">Business Name</Label>
                  <Input
                    id="businessName"
                    type="text"
                    placeholder="Amazing Photos Studio"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="font-normal">Location (City, State)</Label>
                  <Input
                    id="location"
                    type="text"
                    placeholder="Mumbai, Maharashtra"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-foreground hover:bg-foreground/90 h-11 rounded-full font-normal text-white">
              Register
            </Button>
            <p className="text-sm text-center text-muted-foreground font-light">
              Already have an account?{' '}
              <Link href="/login" className="text-foreground hover:underline font-normal">
                Login here
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
