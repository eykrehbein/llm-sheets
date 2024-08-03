import os
import sys
from PyPDF2 import PdfReader, PdfWriter
from pdf2image import convert_from_path


def split_pdf(pdf_path):
    # Get the directory and filename of the input PDF
    pdf_dir = os.path.dirname(pdf_path)
    pdf_filename = os.path.basename(pdf_path)
    pdf_name = os.path.splitext(pdf_filename)[0]

    # Create output directories
    pages_dir = os.path.join(pdf_dir, f"{pdf_name}-pages")
    images_dir = os.path.join(pdf_dir, f"{pdf_name}-images")
    os.makedirs(pages_dir, exist_ok=True)
    os.makedirs(images_dir, exist_ok=True)

    # Open the PDF file
    with open(pdf_path, 'rb') as file:
        pdf = PdfReader(file)

        # Split PDF into individual pages
        for page_num in range(len(pdf.pages)):
            pdf_writer = PdfWriter()
            pdf_writer.add_page(pdf.pages[page_num])

            output_filename = os.path.join(pages_dir, f"{page_num + 1}.pdf")
            with open(output_filename, 'wb') as output_file:
                pdf_writer.write(output_file)

            print(f"Page {page_num + 1} saved as {output_filename}")

    # Convert PDF pages to images
    pages = convert_from_path(pdf_path)
    for i, page in enumerate(pages):
        image_filename = os.path.join(images_dir, f"{i + 1}.png")
        page.save(image_filename, "PNG")
        print(f"Page {i + 1} converted to image: {image_filename}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python script.py <path_to_pdf>")
        sys.exit(1)

    pdf_path = sys.argv[1]
    if not os.path.isfile(pdf_path):
        print(f"Error: File '{pdf_path}' does not exist.")
        sys.exit(1)

    split_pdf(pdf_path)
    print("PDF splitting and image conversion completed.")
