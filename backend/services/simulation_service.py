from models import SimulationRequest, Scores

def calculate_scores(req: SimulationRequest) -> Scores:
    """
    Deterministic rule-based calculation for future scores based on user constraints.
    Returns bounded scores between 0 and 100.
    """
    p = req.personal
    se = req.socio_economic
    e = req.environmental
    m = req.macro_dynamic

    base = 50

    # HEALTH
    health = base + (p.sleep - 7) * 4
    if p.exercise == '5+ times/week': health += 20
    elif p.exercise == '3-4 times/week': health += 10
    elif p.exercise == '1-2 times/week': health += 5
    elif p.exercise == 'None': health -= 15
    health -= (p.screenTime - 4) * 2

    # CAREER
    career = base + (p.productivity - 6) * 4
    if e.workCulture == 'Hybrid': career += 5
    elif e.workCulture == 'Remote': career += 2
    if m.industryVolatility == 'Low': career += 10
    elif m.industryVolatility == 'High': career -= 10
    if p.sleep < 5: career -= 10

    # FINANCE
    finance = base + (p.savings - 10) * 0.8
    if se.familyIncome == 'High': finance += 20
    elif se.familyIncome == 'Low': finance -= 15
    if m.economicCondition == 'Growth': finance += 10
    elif m.economicCondition == 'Recession': finance -= 15

    # MENTAL
    mental = base - (p.stressLevel - 5) * 5
    if se.supportSystem == 'Strong': mental += 20
    elif se.supportSystem == 'Weak': mental -= 15
    if e.stressExposure == 'High': mental -= 15
    elif e.stressExposure == 'Low': mental += 10
    if p.exercise != 'None': mental += 10

    # SHOCK PREPAREDNESS
    shock = base + (p.savings - 10) * 0.5
    if m.techAdaptability == 'High': shock += 15
    elif m.techAdaptability == 'Low': shock -= 15
    if m.automationRisk == 'High': shock -= 15
    if se.accessResources == 'Abundant': shock += 15
    elif se.accessResources == 'Limited': shock -= 15

    # Bound everything 0-100
    def bound(val):
        return max(0, min(100, int(val)))

    return Scores(
        health=bound(health),
        career=bound(career),
        finance=bound(finance),
        mental=bound(mental),
        shock_preparedness=bound(shock)
    )
