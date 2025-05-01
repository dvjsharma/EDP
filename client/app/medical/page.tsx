"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { doc, updateDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Icons } from "@/components/icons"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

export default function MedicalProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasBioData, setHasBioData] = useState(false)

  // Form state
  const [age, setAge] = useState("")
  const [gender, setGender] = useState("")
  const [condition, setCondition] = useState("")
  const [conditions, setConditions] = useState<string[]>([])
  const [medication, setMedication] = useState("")
  const [medications, setMedications] = useState<string[]>([])
  const [smokingHabit, setSmokingHabit] = useState(false)
  const [drinkingHabit, setDrinkingHabit] = useState(false)
  const [activityLevel, setActivityLevel] = useState("")
  const [weightKg, setWeightKg] = useState("")
  const [heightCm, setHeightCm] = useState("")
  const [sleepHoursPerNight, setSleepHoursPerNight] = useState("")
  const [allergy, setAllergy] = useState("")
  const [allergies, setAllergies] = useState<string[]>([])

  // Calculate BMI
  const calculateBMI = () => {
    if (weightKg && heightCm) {
      const weight = Number.parseFloat(weightKg)
      const height = Number.parseFloat(heightCm) / 100 // convert cm to m
      if (weight > 0 && height > 0) {
        const bmi = (weight / (height * height)).toFixed(1)
        return bmi
      }
    }
    return ""
  }

  const bmi = calculateBMI()

  // Check if user already has bioData
  useEffect(() => {
    const checkBioData = async () => {
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            if (userData.bioData && Object.keys(userData.bioData).length > 0) {
              setHasBioData(true)

              // Pre-fill form with existing data
              const bioData = userData.bioData
              if (bioData.age) setAge(bioData.age.toString())
              if (bioData.gender) setGender(bioData.gender)
              if (bioData.conditions) setConditions(bioData.conditions)
              if (bioData.medications) setMedications(bioData.medications)
              if (bioData.habit_smoking !== undefined) setSmokingHabit(bioData.habit_smoking)
              if (bioData.habit_drinking !== undefined) setDrinkingHabit(bioData.habit_drinking)
              if (bioData.activityLevel) setActivityLevel(bioData.activityLevel)
              if (bioData.weightKg) setWeightKg(bioData.weightKg)
              if (bioData.heightCm) setHeightCm(bioData.heightCm)
              if (bioData.sleepHoursPerNight) setSleepHoursPerNight(bioData.sleepHoursPerNight)
              if (bioData.allergies) setAllergies(bioData.allergies)
            } else {
              // If user is coming from another page and has no bioData, redirect to dashboard
              const referrer = document.referrer
              if (referrer && !referrer.includes("/signup") && !referrer.includes("/login")) {
                router.push("/")
              }
            }
          }
        } catch (error) {
          console.error("Error checking bioData:", error)
        }
      }
    }

    if (!loading) {
      if (!user) {
        router.push("/login")
      } else {
        checkBioData()
      }
    }
  }, [user, loading, router])

  // Add condition to list
  const addCondition = () => {
    if (condition && !conditions.includes(condition)) {
      setConditions([...conditions, condition])
      setCondition("")
    }
  }

  // Remove condition from list
  const removeCondition = (conditionToRemove: string) => {
    setConditions(conditions.filter((c) => c !== conditionToRemove))
  }

  // Add medication to list
  const addMedication = () => {
    if (medication && !medications.includes(medication)) {
      setMedications([...medications, medication])
      setMedication("")
    }
  }

  // Remove medication from list
  const removeMedication = (medicationToRemove: string) => {
    setMedications(medications.filter((m) => m !== medicationToRemove))
  }

  // Add allergy to list
  const addAllergy = () => {
    if (allergy && !allergies.includes(allergy)) {
      setAllergies([...allergies, allergy])
      setAllergy("")
    }
  }

  // Remove allergy from list
  const removeAllergy = (allergyToRemove: string) => {
    setAllergies(allergies.filter((a) => a !== allergyToRemove))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.uid) {
      toast({
        title: "Error",
        description: "You must be logged in to submit this form",
        variant: "destructive",
      })
      return
    }

    // Validate required fields
    if (!age || !gender || !weightKg || !heightCm) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const bioData = {
        age: Number.parseInt(age),
        gender,
        conditions,
        medications,
        habit_smoking: smokingHabit,
        habit_drinking: drinkingHabit,
        activityLevel,
        weightKg,
        heightCm,
        bmi,
        sleepHoursPerNight,
        allergies,
      }

      // Update user document in Firestore
      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, { bioData })

      toast({
        title: "Profile updated",
        description: "Your medical profile has been saved successfully",
      })

      // Redirect to dashboard
      router.push("/")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save medical profile",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Medical Profile</CardTitle>
          <CardDescription>
            {hasBioData
              ? "Update your medical information to help us provide better health insights"
              : "Please provide your medical information to continue"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Age */}
              <div className="space-y-2">
                <Label htmlFor="age" className="required">
                  Age
                </Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Enter your age"
                  required
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender" className="required">
                  Gender
                </Label>
                <Select value={gender} onValueChange={setGender} required>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Weight */}
              <div className="space-y-2">
                <Label htmlFor="weight" className="required">
                  Weight (kg)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="Enter your weight in kg"
                  required
                />
              </div>

              {/* Height */}
              <div className="space-y-2">
                <Label htmlFor="height" className="required">
                  Height (cm)
                </Label>
                <Input
                  id="height"
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="Enter your height in cm"
                  required
                />
              </div>

              {/* BMI (calculated) */}
              <div className="space-y-2">
                <Label htmlFor="bmi">BMI (calculated)</Label>
                <Input id="bmi" value={bmi} readOnly placeholder="BMI will be calculated" />
              </div>

              {/* Sleep Hours */}
              <div className="space-y-2">
                <Label htmlFor="sleep">Sleep Hours (per night)</Label>
                <Input
                  id="sleep"
                  type="number"
                  step="0.5"
                  value={sleepHoursPerNight}
                  onChange={(e) => setSleepHoursPerNight(e.target.value)}
                  placeholder="Average hours of sleep"
                />
              </div>

              {/* Activity Level */}
              <div className="space-y-2">
                <Label htmlFor="activity">Activity Level</Label>
                <Select value={activityLevel} onValueChange={setActivityLevel}>
                  <SelectTrigger id="activity">
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                    <SelectItem value="light">Light (exercise 1-3 days/week)</SelectItem>
                    <SelectItem value="moderate">Moderate (exercise 3-5 days/week)</SelectItem>
                    <SelectItem value="active">Active (exercise 6-7 days/week)</SelectItem>
                    <SelectItem value="very-active">Very Active (intense exercise daily)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Medical Conditions */}
            <div className="space-y-2">
              <Label>Medical Conditions</Label>
              <div className="flex gap-2">
                <Input
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  placeholder="Add medical condition"
                />
                <Button type="button" onClick={addCondition} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {conditions.map((c, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {c}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeCondition(c)} />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Medications */}
            <div className="space-y-2">
              <Label>Medications</Label>
              <div className="flex gap-2">
                <Input
                  value={medication}
                  onChange={(e) => setMedication(e.target.value)}
                  placeholder="Add medication"
                />
                <Button type="button" onClick={addMedication} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {medications.map((m, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {m}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeMedication(m)} />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Allergies */}
            <div className="space-y-2">
              <Label>Allergies</Label>
              <div className="flex gap-2">
                <Input value={allergy} onChange={(e) => setAllergy(e.target.value)} placeholder="Add allergy" />
                <Button type="button" onClick={addAllergy} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {allergies.map((a, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {a}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeAllergy(a)} />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Habits */}
            <div className="space-y-4">
              <Label>Habits</Label>
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="smoking"
                    checked={smokingHabit}
                    onCheckedChange={(checked) => setSmokingHabit(checked === true)}
                  />
                  <Label htmlFor="smoking" className="cursor-pointer">
                    Smoking
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="drinking"
                    checked={drinkingHabit}
                    onCheckedChange={(checked) => setDrinkingHabit(checked === true)}
                  />
                  <Label htmlFor="drinking" className="cursor-pointer">
                    Alcohol Consumption
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Medical Profile"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
