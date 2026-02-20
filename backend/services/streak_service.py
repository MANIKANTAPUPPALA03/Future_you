from datetime import datetime
from typing import Dict, Any

def process_streak_update(current_streak: int, longest_streak: int, last_active: str, completed_today: bool) -> Dict[str, Any]:
    """
    Evaluates streak logic based on whether today's objective was completed, resolving
    daily boundaries securely from server time.
    """
    today_str = datetime.utcnow().strftime('%Y-%m-%d')
    
    if last_active == today_str:
        # Already processed today
        return {
            "current_streak": current_streak,
            "longest_streak": longest_streak,
            "last_active_date": last_active
        }

    if completed_today:
        try:
            if last_active:
                last_date = datetime.strptime(last_active, '%Y-%m-%d')
                delta = (datetime.utcnow() - last_date).days
                if delta == 1:
                    current_streak += 1
                elif delta > 1:
                    current_streak = 1 # Reset if skipped a day
            else:
                current_streak = 1
        except ValueError:
            current_streak = 1

        if current_streak > longest_streak:
            longest_streak = current_streak
    else:
        # Explicit fail/reset
        current_streak = 0
        
    return {
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "last_active_date": today_str if completed_today else last_active
    }
