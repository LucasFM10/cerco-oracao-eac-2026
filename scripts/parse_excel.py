import pandas as pd
import json
import re

def parse_time_slot(col):
    # Flexible regex to match day and first time part
    # Day can be Sexta-feira, Sexta, Sábado, Sabado
    day_match = re.search(r'(Sexta|Sábado|Sabado)', col, re.I)
    time_match = re.search(r'(\d+)h(\d*)', col)
    
    if not day_match or not time_match:
        return None
    
    day_raw = day_match.group(1).lower()
    day = 'sexta' if 'sexta' in day_raw else 'sabado'
    hour = time_match.group(1).zfill(2)
    minute = time_match.group(2).zfill(2) if time_match.group(2) else '00'
    
    return f"{day}_{hour}h{minute}"

def run():
    df = pd.read_excel('24 horas de oração pelo EAC PSPP 2026 (respostas).xlsx')
    
    # Identify slot columns
    slot_cols = [c for c in df.columns if '[' in c and ']' in c]
    
    col_mapping = {}
    for c in slot_cols:
        slot_id = parse_time_slot(c)
        if slot_id:
            col_mapping[c] = slot_id

    final_data = {}

    # Required columns (using index because names might have encoding issues)
    # 0: Timestamp, 1: Nome, 2: Celular, 3: Equipe
    
    for _, row in df.iterrows():
        nome = str(row.iloc[1])
        celular = str(row.iloc[2])
        equipe = str(row.iloc[3])
        
        for col, slot_id in col_mapping.items():
            if pd.notna(row[col]):
                # If slot already has someone, this might overwrite or we could keep a list
                # Prompt says: { ocupado: boolean, nome: string, celular: string, equipe: string }
                # We'll stick to one person.
                final_data[slot_id] = {
                    "ocupado": True,
                    "nome": nome,
                    "celular": celular,
                    "equipe": equipe
                }

    with open('migration_data.json', 'w', encoding='utf-8') as f:
        json.dump(final_data, f, ensure_ascii=False, indent=2)

    print(f"Generated migration_data.json with {len(final_data)} slots.")

if __name__ == "__main__":
    run()
