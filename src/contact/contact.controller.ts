import { Body, Controller, Post } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactDto } from './contact.dto';

@Controller('contact')
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Post()
  async save(@Body() payload: ContactDto) {
    await this.contactService.save(payload);

    return { message: 'Contact created successfully' };
  }
}
