import json
from models import PlanRequest
from typing import Dict, Any
from .groq_service import generate_ai_insights

def generate_deterministic_plan(req: PlanRequest) -> Dict[str, Any]:
    """
    Generates a daily plan using Groq AI based on the requested planner type and constraints. 
    """
    
    # Base Instruction
    prompt = f"""
    You are an expert Strategic Life Planner. Generate a highly practical and specific daily schedule based on the following configurations:
    Planner Type: {req.intensity_mode.upper()}
    """

    # Dynamic Injections based on planner type
    if req.intensity_mode == "study":
        prompt += f"""
        Wake Up Time: {req.wake_time}
        Sleep Time: {req.sleep_time}
        College Timings: {req.college_timing_start} to {req.college_timing_end}
        Focus: Maximize academic deep study blocks around the college schedule. Include recovery.
        CRITICAL CONSTRAINT: Do NOT schedule any 'work', 'study', or 'deep work' during the EXACT hours of the user's College Timings ({req.college_timing_start} to {req.college_timing_end}). 
        During that window of {req.college_timing_start} to {req.college_timing_end}, you MUST only schedule an activity like 'Attending Classes / College' set to type 'work' or 'growth'. 
        Also, ensure no activities are scheduled between Sleep Time ({req.sleep_time}) and Wake Up Time ({req.wake_time}).
        """
    elif req.intensity_mode == "routine":
        prompt += f"""
        Wake Up Time: {req.wake_time}
        Sleep Time: {req.sleep_time}
        Current Status: {req.routine_status}
        Work Pace: {req.routine_pace}
        Focus: Build a structured daily routine optimized for a {req.routine_status} who prefers a '{req.routine_pace}' work pace.
        CRITICAL CONSTRAINT: Ensure no activities are scheduled between Sleep Time ({req.sleep_time}) and Wake Up Time ({req.wake_time}).
        """
    elif req.intensity_mode == "work":
        prompt += f"""
        Wake Up Time: {req.wake_time}
        Sleep Time: {req.sleep_time}
        Work Hours: {req.work_start} to {req.work_end}
        Commute: {req.commute_duration}
        Industry: {req.industry}
        Focus: Optimize for Professional Deep Work in the {req.industry} sector. Include administrative and email blocks, and separate deep creative work.
        CRITICAL CONSTRAINT: All core 'work' tasks MUST fit within {req.work_start} to {req.work_end}. Account for {req.commute_duration} commute time directly before and after work hours if applicable.
        Ensure no activities are scheduled between Sleep Time ({req.sleep_time}) and Wake Up Time ({req.wake_time}).
        """
    elif req.intensity_mode == "stress":
        prompt += f"""
        Wake Up Time: {req.wake_time}
        Sleep Time: {req.sleep_time}
        Primary Stress Source: {req.stress_source}
        Favorite Recovery Activity: {req.recovery_activity}
        Focus: Optimize for Stress Relief and Recovery tailored to combat {req.stress_source} stress. Insert frequent micro-breaks, meditation, and low-intensity tasks.
        CRITICAL CONSTRAINT: You MUST include at least one dedicated block for their favorite recovery activity: {req.recovery_activity}.
        Ensure no activities are scheduled between Sleep Time ({req.sleep_time}) and Wake Up Time ({req.wake_time}).
        """
    elif req.intensity_mode == "financial":
        prompt += f"""
        Savings Target: ${req.fin_target} / {req.fin_interval}
        Income Focus: {req.income_focus}
        Frugality Level: {req.frugality}
        Focus: Dedicate blocks to side-hustles, upskilling, or career networking to hit the ${req.fin_target} savings goal.
        Adapt the aggressiveness of the plan to match a '{req.frugality}' frugality lifestyle.
        CRITICAL CONSTRAINT: Ensure no activities are scheduled between Sleep Time ({req.sleep_time}) and Wake Up Time ({req.wake_time}).
        """
    else:  # 'all'
        prompt += f"""
        Wake Up Time: {req.wake_time}
        Sleep Time: {req.sleep_time}
        Primary Life Goal: {req.primary_goal}
        Weekly Exercise Target: {req.exercise_days}
        Focus: Create an all-encompassing, highly optimized \"All-in-One\" master blueprint for personal and professional growth, heavily biased towards achieving '{req.primary_goal}'.
        CRITICAL CONSTRAINT: Ensure no activities are scheduled between Sleep Time ({req.sleep_time}) and Wake Up Time ({req.wake_time}). Include daily 'health' blocks to meet the target.
        """

    prompt += """
    
    OUTPUT FORMAT REQUIREMENTS:
    You MUST output valid, parsable JSON. Do NOT include markdown blocks like ```json.
    Return a root object with exactly two keys:
    1. "intensity_mode": A short string describing the vibe (e.g., "Aggressive", "Balanced", "Recovery", "Academic").
    2. "blueprint": An array of objects. Each object must have "time", "activity", and "type" (one of: 'work', 'health', 'wellness', 'break', 'growth').
    
    Example:
    {
      "intensity_mode": "Balanced",
      "blueprint": [
         {"time": "07:00 AM", "activity": "Morning Routine", "type": "wellness"},
         {"time": "09:00 AM - 12:00 PM", "activity": "Deep Work", "type": "work"}
      ]
    }
    """
    
    try:
        raw_response = generate_ai_insights(prompt)
        
        # Clean any accidental markdown fences the LLM threw in
        clean_json = raw_response.replace("```json", "").replace("```", "").strip()
        
        parsed_plan = json.loads(clean_json)
        return parsed_plan
    except Exception as e:
        print(f"Error parsing AI Planner output: {e}")
        # Fallback to deterministic if the LLM hallucinated the JSON
        return {
            "blueprint": [
                {"time": "08:00 AM", "activity": "System Error: Fallback Mode", "type": "wellness"},
                {"time": "09:00 AM - 05:00 PM", "activity": "Plan generated a parsing error. Please try again.", "type": "break"}
            ],
            "intensity_mode": "Error"
        }
