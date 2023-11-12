import pypandoc
import subprocess
import pdftotext
import pandas as pd
import docx2txt
import textract

def doc_to_text(file_path):
    try:
        output = textract.process(file_path)
    except Exception as e:
        print(f"An error occurred: {e}")
        return False
    return output.decode('utf-8')

def docx_to_text(file_path):
    try:
        output = pypandoc.convert_file(file_path, 'plain', format='docx')
    except Exception as e:
        try:
            output = docx2txt.process(file_path)
        except Exception as e:
            return False
    return output

def pdf_to_text(file_path):
    try:
        output = subprocess.check_output(['pdftotext', '-layout', file_path, '-'])
        text = output.decode('utf-8')
    except Exception as e:
        return False

    if len(text) > 0:
        return text

    try:
        with open(file_path, "rb") as f:
            pdf = pdftotext.PDF(f)
    except Exception as e:
        return False

    return "\n\n".join(pdf)

def xls_to_text(file_path):
    df = pd.read_excel(file_path)
    return df.to_string()

def pptx_to_text(file_path):
    try:
        output = pypandoc.convert_file(file_path, 'plain', format='pptx')
    except Exception as e:
        return False
    return output

def bin_to_text(file_path):
    try:
        with open(file_path, 'rb') as f:
            return f.read()
    except Exception as e:
        return False

def rtf_to_text(file_path):
    try:
        output = pypandoc.convert_file(file_path, 'plain', format='rtf')
    except Exception as e:
        return False
    return output

def document_to_text(file_path):
    if file_path.endswith('.docx'):
        return docx_to_text(file_path)
    elif file_path.endswith('.doc'):
        return doc_to_text(file_path)
    elif file_path.endswith('.pdf'):
        return pdf_to_text(file_path)
    elif file_path.endswith('.xls'):
        return xls_to_text(file_path)
    elif file_path.endswith('.pptx'):
        return pptx_to_text(file_path)
    elif file_path.endswith('.bin'):
        return xls_to_text(file_path) # .bin files seem to be Excel files
    elif file_path.endswith('.rtf'):
        return rtf_to_text(file_path)
    else:
        return False
