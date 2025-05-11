"""
Data Preparation Script for LIT (Lifeline Inside Telephone)
This script loads 911 call transcripts from Hugging Face (MIT License),
optionally augments with Hindi translations, and formats them into
input-target JSONL for Q&A style fine-tuning.
"""

import os
import json
import sys
import logging
from typing import List, Dict, Any, Optional
import argparse
import random

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Check for required packages
required_packages = ['pandas', 'datasets', 'tqdm']
missing_packages = []

for package in required_packages:
    try:
        __import__(package)
    except ImportError:
        missing_packages.append(package)

if missing_packages:
    print(f"ERROR: Missing required packages: {', '.join(missing_packages)}")
    print("Please install them using:")
    print(f"pip install {' '.join(missing_packages)}")
    sys.exit(1)

# Now import the packages
import pandas as pd
from datasets import load_dataset
from tqdm import tqdm

# Optional: For Hindi translation
try:
    from transformers import MarianMTModel, MarianTokenizer
    import requests
    TRANSLATION_AVAILABLE = True
except ImportError:
    TRANSLATION_AVAILABLE = False
    print("Translation modules not available. Install with: pip install transformers sentencepiece requests")

def load_911_dataset():
    """Load the MIT-licensed 911 call transcripts dataset from Hugging Face"""
    print("Loading 911 call transcripts dataset (MIT License)...")
    try:
        dataset = load_dataset("spikecodes/911-call-transcripts", use_auth_token=os.getenv("HF_API_TOKEN"))
        print(f"Dataset loaded successfully with {len(dataset['train'])} examples")
        return dataset
    except Exception as e:
        print(f"Error loading dataset: {e}")
        print("Make sure you have set HF_API_TOKEN if the dataset requires authentication")
        raise

def setup_translation_model():
    """Setup English to Hindi translation model"""
    if not TRANSLATION_AVAILABLE:
        return None, None
    
    print("Loading English to Hindi translation model...")
    model_name = "Helsinki-NLP/opus-mt-en-hi"
    tokenizer = MarianTokenizer.from_pretrained(model_name, use_auth_token=os.getenv("HF_API_TOKEN"))
    model = MarianMTModel.from_pretrained(model_name, use_auth_token=os.getenv("HF_API_TOKEN"))
    return model, tokenizer

def translate_to_hindi(text):
    """
    Translate text to Hindi using a translation model.
    This is a stub function that can be implemented with an actual translation service.
    """
    try:
        # Try to import the required modules
        from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
        
        # Log a message about using mock translation
        logger.info("Using mock translation for Hindi")
        
        # For now, just return a mock translation
        return f"[HINDI TRANSLATION] {text}"
    except ImportError:
        logger.info("Translation modules not available. Install with: pip install transformers sentencepiece requests")
        return f"[HINDI TRANSLATION UNAVAILABLE] {text}"
    except Exception as e:
        logger.error(f"Error in translation: {e}")
        return f"[HINDI TRANSLATION ERROR] {text}"

def clean_transcript(transcript: str) -> str:
    """Clean and format the transcript text"""
    # Remove multiple spaces
    transcript = ' '.join(transcript.split())
    # Remove special characters but keep essential punctuation
    transcript = ''.join(c for c in transcript if c.isalnum() or c in ' .,?!:;-()[]{}\'\"')
    return transcript.strip()

def extract_emergency_details(transcript: str) -> Dict[str, Any]:
    """
    Extract emergency details from transcript using rule-based approach
    In a real implementation, this would be more sophisticated
    """
    # Simple keyword-based categorization
    categories = {
        'medical': ['ambulance', 'heart', 'breathing', 'blood', 'injury', 'hurt', 'pain', 'sick'],
        'fire': ['fire', 'smoke', 'burning', 'flames', 'heat'],
        'police': ['police', 'crime', 'theft', 'robbery', 'attack', 'weapon', 'gun', 'knife'],
        'traffic': ['accident', 'crash', 'collision', 'car', 'vehicle', 'road', 'highway'],
    }
    
    # Simple severity detection
    severity_keywords = {
        'high': ['emergency', 'critical', 'severe', 'dying', 'death', 'urgent', 'immediately'],
        'medium': ['serious', 'bad', 'significant', 'concerning'],
        'low': ['minor', 'small', 'little', 'not serious']
    }
    
    # Determine category
    category = 'unknown'
    max_matches = 0
    for cat, keywords in categories.items():
        matches = sum(1 for keyword in keywords if keyword.lower() in transcript.lower())
        if matches > max_matches:
            max_matches = matches
            category = cat
    
    # Determine severity
    severity = 'medium'  # Default
    for level, keywords in severity_keywords.items():
        if any(keyword.lower() in transcript.lower() for keyword in keywords):
            severity = level
            break
    
    # Extract location (simplified - in real implementation use NER)
    location_markers = ['at', 'in', 'near', 'on', 'by']
    location = "unknown"
    for marker in location_markers:
        if f" {marker} " in transcript.lower():
            parts = transcript.lower().split(f" {marker} ")
            if len(parts) > 1:
                location_part = parts[1].split(".")[0].split(",")[0].strip()
                if len(location_part) > 3 and len(location_part.split()) <= 5:
                    location = location_part
                    break
    
    # Determine action based on category and severity
    actions = {
        'medical': {
            'high': 'Dispatch ambulance immediately with paramedics',
            'medium': 'Dispatch ambulance with standard crew',
            'low': 'Advise caller on first aid and dispatch medical assistance'
        },
        'fire': {
            'high': 'Dispatch fire brigade with full equipment immediately',
            'medium': 'Dispatch fire brigade with standard equipment',
            'low': 'Send fire assessment team'
        },
        'police': {
            'high': 'Dispatch armed police units immediately',
            'medium': 'Dispatch police patrol',
            'low': 'File police report and schedule follow-up'
        },
        'traffic': {
            'high': 'Dispatch ambulance, police, and traffic management',
            'medium': 'Dispatch police and traffic management',
            'low': 'Dispatch traffic management team'
        },
        'unknown': {
            'high': 'Dispatch emergency assessment team immediately',
            'medium': 'Dispatch assessment team',
            'low': 'Schedule follow-up call'
        }
    }
    
    action = actions.get(category, actions['unknown']).get(severity, actions['unknown']['medium'])
    
    return {
        "category": category,
        "severity": severity,
        "location": location,
        "action": action
    }

def create_structured_output(transcript: str) -> str:
    """Create a structured output format for the model to learn"""
    details = extract_emergency_details(transcript)
    output = f"""Location: {details['location']}
Category: {details['category']}
Severity: {details['severity']}
Recommended Action: {details['action']}"""
    return output

def process_dataset(dataset, include_hindi=False):
    """Process the dataset into a format suitable for fine-tuning"""
    processed_data = []
    
    for item in tqdm(dataset["train"]):
        messages = item["messages"]
        transcript_parts = []
        
        for msg in messages:
            if isinstance(msg, dict) and "content" in msg and msg["content"] is not None:
                transcript_parts.append(msg["content"])
        
        transcript = " ".join(transcript_parts)
        if not transcript.strip():
            continue
        
        # Clean the transcript
        transcript = clean_transcript(transcript)
        
        # Create a structured output format for the model to learn
        output = create_structured_output(transcript)
        
        # Add to processed data
        processed_item = {
            "input": transcript,
            "output": output
        }
        
        processed_data.append(processed_item)
        
        # Optionally add Hindi version
        if include_hindi:
            hindi_transcript = translate_to_hindi(transcript)
            hindi_output = output  # Keep the same structured output
            
            hindi_item = {
                "input": hindi_transcript,
                "output": hindi_output
            }
            
            processed_data.append(hindi_item)
    
    return processed_data

def augment_with_hindi(dataset, model, tokenizer, augmentation_percentage=0.3):
    """Augment dataset with Hindi translations"""
    if not model or not tokenizer:
        print("Hindi translation not available, skipping augmentation")
        return dataset
    
    augmented_data = []
    num_to_augment = int(len(dataset) * augmentation_percentage)
    
    print(f"Augmenting {num_to_augment} samples with Hindi translations...")
    indices_to_augment = random.sample(range(len(dataset)), num_to_augment)
    
    for i in tqdm(range(len(dataset))):
        # Keep original sample
        augmented_data.append(dataset[i])
        
        # Add Hindi translation for selected samples
        if i in indices_to_augment:
            hindi_sample = dataset[i].copy()
            hindi_sample["input"] = translate_to_hindi(dataset[i]["input"])
            augmented_data.append(hindi_sample)
    
    print(f"Dataset augmented from {len(dataset)} to {len(augmented_data)} samples")
    return augmented_data

def save_to_jsonl(data, output_file):
    """Save data to JSONL format"""
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    print(f"Saving {len(data)} processed samples to {output_file}")
    with open(output_file, 'w', encoding='utf-8') as f:
        for item in data:
            f.write(json.dumps(item, ensure_ascii=False) + '\n')

def main():
    parser = argparse.ArgumentParser(description="Process 911 call transcripts for LLM fine-tuning")
    parser.add_argument("--output_dir", type=str, default="data/processed",
                        help="Output directory for JSONL files")
    parser.add_argument("--translate", action="store_true",
                        help="Augment dataset with Hindi translations")
    args = parser.parse_args()
    
    try:
        # Create output directory
        os.makedirs(args.output_dir, exist_ok=True)
        logger.info(f"Created output directory: {args.output_dir}")
        
        # Load dataset
        logger.info("Loading dataset...")
        dataset = load_911_dataset()
        
        # Process dataset and split into train/validation
        logger.info("Processing dataset and splitting into train/validation...")
        processed_data = process_dataset(dataset, include_hindi=args.translate)
        
        # Optionally augment with Hindi translations
        if args.translate:
            model, tokenizer = setup_translation_model()
            if model and tokenizer:
                processed_data = augment_with_hindi(processed_data, model, tokenizer)
        
        # Split into train and validation sets (90/10)
        random.shuffle(processed_data)
        split_idx = int(len(processed_data) * 0.9)
        train_data = processed_data[:split_idx]
        valid_data = processed_data[split_idx:]
        
        print(f"Split dataset: {len(train_data)} training examples, {len(valid_data)} validation examples")
        
        # Save to JSONL files
        train_path = os.path.join(args.output_dir, "train.jsonl")
        valid_path = os.path.join(args.output_dir, "valid.jsonl")
        
        logger.info(f"Saving training data to {train_path}")
        save_to_jsonl(train_data, train_path)
        
        logger.info(f"Saving validation data to {valid_path}")
        save_to_jsonl(valid_data, valid_path)
        
        logger.info("Data preparation completed successfully!")
        logger.info(f"Files saved to: {args.output_dir}")
        logger.info(f"Train samples: {len(train_data)}, Validation samples: {len(valid_data)}")
        
        # Print paths for verification
        print(f"\nOutput files:")
        print(f"- Training data: {os.path.abspath(train_path)}")
        print(f"- Validation data: {os.path.abspath(valid_path)}")
    except Exception as e:
        logger.error(f"Error during data preparation: {e}")
        print(f"ERROR: Data preparation failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
